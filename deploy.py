#!/usr/bin/env python
from __future__ import annotations

import sys
import os
import argparse
import abc
import json
import posixpath
import tempfile
import shutil
import hashlib
import requests

from collections import defaultdict
from urllib.parse import urlsplit
from tqdm import tqdm
from pymatgen.io.abinit.pseudos import Pseudo, PawXmlSetup


ALL_ELEMENTS = set([
  'H', 'He',
  'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne','Na', 'Mg', "Al", "Si", 'P', 'S', 'Cl', 'Ar',
  'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr',
  'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe',
  'Cs', 'Ba',
  'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er','Tm','Yb', 'Lu',
  'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn',
  "Fr", "Ra",
  "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr",
  "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og",
  "Uue", "Ubn",
])


def download_repo_from_url(url: str, save_dirpath: str,
                           chunk_size: int = 2 * 1024**2, verbose: int = 0) -> None:
    """
    Dowload file from url.

    Args:
        url: The url from which the targz is taken.
        save_dirpath: The directory in which the tarball is unpacked.
        chunk_size: Chunk size used for downloading the file.
        verbose: Verbosity level
    """
    path = urlsplit(url).path
    filename = posixpath.basename(path)
    #print(path, filename)

    # stream = True is required by the iter_content below
    with requests.get(url, stream=True) as r:
        #tmp_dir = tempfile.mkdtemp()
        with tempfile.TemporaryDirectory(suffix=None, prefix=None, dir=None) as tmp_dir:
            tmp_filepath = os.path.join(tmp_dir, filename)
            if verbose:
                print("Writing temporary file:", tmp_filepath)

            total_size_in_bytes = int(r.headers.get('content-length', 0))
            progress_bar = tqdm(total=total_size_in_bytes, unit='iB', unit_scale=True)

            with open(tmp_filepath, 'wb') as fd:
                for chunk in r.iter_content(chunk_size=chunk_size):
                    fd.write(chunk)
                    progress_bar.update(len(chunk))

            progress_bar.close()
            if total_size_in_bytes != 0 and progress_bar.n != total_size_in_bytes:
                raise RuntimeError(f"Something went wrong while donwloading url: {url}")

            shutil.unpack_archive(tmp_filepath, extract_dir=tmp_dir)

            dirpaths = [os.path.join(tmp_dir, basen) for basen in os.listdir(tmp_dir) if basen != filename]

            if len(dirpaths) != 1:
                raise RuntimeError(f"Expecting single directory, got {dirpaths}")
            if not os.path.isdir(dirpaths[0]):
                raise RuntimeError(f"Expecting single directory, got {dirpaths}")

            if verbose: print(f"Moving {dirpaths[0]} to {save_dirpath}")
            shutil.move(dirpaths[0], save_dirpath)


def md5_for_filepath(filepath: str) -> str:
    """
    Compute and return the md5 of a file.
    """
    with open(filepath, "rt") as fh:
        text = fh.read()
        m = hashlib.md5(text.encode("utf-8"))
        return m.hexdigest()


class PseudosRepo(abc.ABC):
    """
    """

    def __init__(self, ps_generator: str, xc_name: str, relativity_type: str, project_name: str,
                 version: str, url: str):
        """
        Args:
            ps_generator: Name of the pseudopotential generator
            xc_name: XC functional.
            relativity_type: SR for scalar-relativistic or FR for fully relativistic.
            project_name: Name of the project associated to this repository.
            version: Version string.
            url: URL from which the targz will be taken.
        """
        if relativity_type not in {"SR", "FR"}:
            raise ValueError(f"Invalid relativity_type: {relativity_type}")

        self.ps_generator = ps_generator
        self.xc_name = xc_name
        self.version = version
        self.project_name = project_name
        self.relativity_type = relativity_type
        self.url = url

    @property
    def isnc(self) -> bool:
        """True if norm-conserving repo."""
        return self.ps_type == "NC"

    @property
    def ispaw(self) -> bool:
        """True if PAW repo."""
        return self.ps_type == "PAW"

    #####################
    # Abstract interface.
    #####################

    #@abc.abstractmethod
    #def validate_checksums(self, verbose: int) -> None:
    #    """Validate md5 checksums after download."""

    @property
    @abc.abstractmethod
    def ps_type(self) -> str:
        """Pseudopotential type e.g. NC or PAW"""

    @property
    @abc.abstractmethod
    def name(self):
        """The name of repository built from the metadata. Must be unique"""

    @property
    @abc.abstractmethod
    def formats(self):
        """List of file formats provided by the repository."""

    def setup(self, from_scratch: bool) -> None:
        """
        Perform the initialization step:

            1) Download the tarball from the github url, unpack it and save it in the self.name directory.
            2) Build list of tables by extracting the relative paths from the `table_name.txt` files.
               found in the top-level directory and build self.tables
            3) Create targz files with all pseudos associated to a given table.
        """

        doit = from_scratch or (not from_scratch and not os.path.isdir(self.name))

        if doit:
            # Get the targz from github and unpack it inside directory `self.name`.
            print("Downloading:", self.url, "to:", self.name)
            download_repo_from_url(self.url, self.name)
        else:
            print("Skipping dowload step as", self.name, "directory already exists")

        table_paths = [f for f in os.listdir(self.name) if f.endswith(".txt")]
        table_paths = [os.path.join(self.name, t) for t in table_paths]
        assert table_paths

        # Get the list of table names from `table_name.txt` and create tar.gz
        self.tables = defaultdict(dict)
        for table_path in table_paths:
            table_name, _ = os.path.splitext(os.path.basename(table_path))
            with open(table_path, "r") as fh:
                relpaths = [f.strip() for f in fh.readlines() if f.strip()]
                relpaths = [os.path.splitext(p)[0] for p in relpaths]
                # For all the formats provided by the repo.
                for ext in self.formats:
                    all_files = [os.path.join(self.name, f"{rpath}.{ext}") for rpath in relpaths]
                    files = list(filter(os.path.isfile, all_files))
                    if len(files) != len(all_files):
                        print(f"{table_path} WARNING: cannot find files with ext: {ext}.",
                              f"expected: {len(all_files)}, found: {len(files)}")
                    self.tables[table_name][ext] = files
                    #print("table:", table_name, "ext:", ext, "\n", self.tables[table_name][ext])

        # Build targz file with all pseudos belonging to table_name
        # so that the user can download it via the web interface.
        # This part is slow but we do it only once.
        import tarfile
        self.targz = defaultdict(dict)
        for table_name, table in self.tables.items():
            for ext, rpaths in table.items():
                if not rpaths: continue
                tar_path = os.path.join(self.name, f"{self.type}_{self.xc_name}_{table_name}_{ext}.tgz")
                doit = from_scratch or (not from_scratch and not os.path.isfile(tar_path))
                if doit:
                    print("Creating tarball:", tar_path)
                    targz = tarfile.open(tar_path, "w:gz")
                    for rpath in rpaths:
                        targz.add(rpath, arcname=os.path.basename(rpath))
                    targz.close()
                else:
                    print("Skipping tarball creation:", tar_path)
                    assert os.path.isfile(tar_path)

                self.targz[table_name][ext] = tar_path
            print("")


class OncvpspRepo(PseudosRepo):

    @classmethod
    def from_github(cls, xc_name: str, relativity_type: str, version: str) -> OncvpspRepo:
        """
        Build a OncvpsRepo assuming a github repository.
        """
        ps_generator, project_name = "ONCVPSP", "PD"

        if relativity_type == "FR":
            # https://github.com/PseudoDojo/ONCVPSP-PBE-FR-PDv0.4/archive/refs/heads/master.zip
            sub_url = f"{ps_generator}-{xc_name}-FR-{project_name}v{version}"
        elif relativity_type == "SR":
            # https://github.com/PseudoDojo/ONCVPSP-PBE-PDv0.4/archive/refs/heads/master.zip
            sub_url = f"{ps_generator}-{xc_name}-{project_name}v{version}"
        else:
            raise ValueError(f"Invalid relativity_type {relativity_type}")

        url = f"https://github.com/PseudoDojo/{sub_url}/archive/refs/heads/master.zip"
        return cls(ps_generator, xc_name, relativity_type, project_name, version, url)

    @property
    def ps_type(self) -> str:
        return "NC"

    @property
    def name(self) -> str:
        # ONCVPSP-PBEsol-PDv0.4/
        # ONCVPSP-PBE-FR-PDv0.4/
        return f"{self.ps_generator}-{self.xc_name}-{self.relativity_type}-{self.project_name}v{self.version}"

    @property
    def type(self) -> str:
        if self.relativity_type == "FR":
            return f"nc-fr-v{self.version}"
        elif self.relativity_type == "SR":
            return f"nc-sr-v{self.version}"
        else:
            raise ValueError(f"Invalid relativity_type {self.relativity_type}")

    @property
    def formats(self):
        """List of file formats provided by the repository."""
        return ["psp8", "upf", "psml", "html", "djrepo"]


    def get_meta_from_djrepo(self, path: str) -> dict:
        dirname = os.path.dirname(path)
        with open(path, "r") as fh:
            data = json.load(fh)
            hints = data["hints"]
            # parse the pseudo to geh the number of valence electrons.
            pseudo_path = os.path.join(dirname, data["basename"])
            pseudo = Pseudo.from_file(pseudo_path)

            meta = {
                "nv": pseudo.Z_val,
                "hl": hints["low"]["ecut"],
                "hn": hints["normal"]["ecut"],
                "hh": hints["high"]["ecut"]
            }
            #print(f"meta for path: {path}\n", meta)
            return meta




class JthRepo(PseudosRepo):

    @classmethod
    def from_abinit_website(cls, xc_name: str, relativity_type: str, version: str) -> JthRepo:
        ps_generator, project_name = "ATOMPAW", "JTH"
        # https://www.abinit.org/ATOMICDATA/JTH-LDA-atomicdata.tar.gz
        # ATOMPAW-LDA-JTHv0.4
        url = f"https://www.abinit.org/ATOMICDATA/JTH-{xc_name}-atomicdata.tar.gz"
        return cls(ps_generator, xc_name, relativity_type, project_name, version, url)

    @property
    def ps_type(self) -> str:
        return "PAW"

    @property
    def name(self) -> str:
        # ATOMPAW-LDA-JTHv0.4
        return f"{self.ps_generator}-{self.xc_name}-{self.project_name}v{self.version}"

    def validate_checksums(self, verbose: int) -> None:
        print(f"\nValidating md5 checksums of {repr(self)} ...")
        cprint("WARNING: JTH-PAW repository does not support md5 checksums!!!", color="red")

    @property
    def type(self) -> str:
        # FIXME
        if self.relativity_type == "FR":
            return f"jth-fr-v{self.version}"
        elif self.relativity_type == "SR":
            return f"jth-sr-v{self.version}"
        else:
            raise ValueError(f"Invalid relativity_type {self.relativity_type}")

    @property
    def formats(self):
        """List of file formats provided by the repository."""
        return ["xml", "upf"]


    def get_meta_from_pawxml(self, path: str) -> dict:
        pseudo = PawXmlSetup(path)
        meta = {
            "nv": pseudo.valence,
        }

        e = pseudo.root.find("pw_ecut")
        if e is None:
            print("Cannot find hints (pw_ecut) element in:", path)
            low, normal, high = -1, -1, -1
        else:
            hints = e.attrib
            low = float(hints["low"])
            normal = float(hints["medium"])
            high = float(hints["high"])

        meta.update(hl=low, hn=normal, hh=high)
        #print(f"meta for path: {path}\n", meta)
        return meta


class Website:
    """
    files[typ][xc_name][acc][elm][fmt]
    targz[typ][xc_name][acc][fmt]
    """

    def __init__(self, workdir: str, verbose: int) -> None:
        self.workdir = os.path.abspath(workdir)
        self.verbose = verbose

        # Create list of repositories.
        _mk_onc = OncvpspRepo.from_github
        _mk_jth = JthRepo.from_abinit_website

        self.repos = [
            # ONCVPSP repositories.
            _mk_onc(xc_name="PBEsol", relativity_type="SR", version="0.4"),
            _mk_onc(xc_name="PBEsol", relativity_type="FR", version="0.4"),
            _mk_onc(xc_name="PBE", relativity_type="SR", version="0.4"),
            #_mk_onc(xc_name="PBE", relativity_type="FR", version="0.4"),  FIXME: checksum fails
            #
            # JTH repositories.
            _mk_jth(xc_name="LDA", relativity_type="SR", version="1.1"),
            _mk_jth(xc_name="PBE", relativity_type="SR", version="1.1"),
        ]


    def build(self, from_scratch: bool) -> None:
        # files[typ][xc_name][acc][elm][fmt]
        # targz[typ][xc_name][acc][fmt]
        files = defaultdict(dict)
        targz = defaultdict(dict)

        for repo in self.repos:
            repo.setup(from_scratch)
            if repo.type in files and repo.xc_name in files[repo.type]:
                raise ValueError(f"repo.type: {repo.type}, repo.xc_name: {repo.xc_name} is already in {files.keys()}")

            files[repo.type][repo.xc_name] = defaultdict(dict)
            targz[repo.type][repo.xc_name] = defaultdict(dict)

            for table_name, table in repo.tables.items():
                files[repo.type][repo.xc_name][table_name] = defaultdict(dict)
                targz[repo.type][repo.xc_name][table_name] = defaultdict(dict)

                for fmt, rpaths in table.items():

                    # Store the relative location of the targz file
                    if fmt in repo.targz[table_name]:
                        p = os.path.relpath(repo.targz[table_name][fmt], start=self.workdir)
                        targz[repo.type][repo.xc_name][table_name][fmt] = p

                    for rpath in rpaths:

                        if repo.ps_generator == "ONCVPSP":
                            # Get the element symbol from the relative path.
                            # ONCVPSP-PBE-SR-PDv0.4/Ag/Ag-sp.psp8
                            elm = rpath.split(os.sep)[-2]

                            if fmt == "djrepo":
                                # Get hints from djrepo file if NC pseudo.
                                meta = repo.get_meta_from_djrepo(rpath)
                                files[repo.type][repo.xc_name][table_name][elm]["meta"] = meta

                        elif repo.ps_generator == "ATOMPAW":
                            # Get the element symbol from the relative path.
                            # ATOMICDATA/Ag.LDA_PW-JTH.xml
                            elm = os.path.basename(rpath).split(".")[0]
                            # Extract hints from PAW xml
                            if fmt == "xml":
                                meta = repo.get_meta_from_pawxml(rpath)
                                files[repo.type][repo.xc_name][table_name][elm]["meta"] = meta

                        else:
                            raise ValueError("Invalid value for repo.ps_generator: {repo.ps_generator}")

                        if elm not in ALL_ELEMENTS:
                            raise ValueError(f"Invalid element symbol: `{elm}`")

                        files[repo.type][repo.xc_name][table_name][elm][fmt] = rpath

        print("Writing files.json and targz.json")
        with open(os.path.join(self.workdir, "files.json"), "w") as fh:
            json.dump(files, fh, indent=2, sort_keys=True)

        with open(os.path.join(self.workdir, "targz.json"), "w") as fh:
            json.dump(targz, fh, indent=2, sort_keys=True)

        #make_papers()

    #def update(self) -> None:
    #def update_papers(self) -> None:
    #def check(self) -> None:


def new(options) -> int:
    """
    Deploy new website in the current working directory.
    1) download tables from github 2) generate new json files
    """
    website = Website(".", options.verbose)
    website.build(from_scratch=True)
    return 0


def update(options) -> int:
    """
    Update pre-existent installation.
    """
    website = Website(".", options.verbose)
    website.build(from_scratch=False)
    #make_papers()
    return 0


def papers(options) -> int:
    """
    Update the list of papers using PseudoDojo pseudos.
    Generate new papers.html
    """
    #make_papers()
    return 0



def get_epilog() -> str:
    usage = """\

Usage example:

  deploy.py new           =>  Upload git repos and deploy website from SCRATCH.
  deploy.py update        =>  Update git repos.
"""


    return usage


def get_parser(with_epilog=False):

    # Parent parser for common options.
    copts_parser = argparse.ArgumentParser(add_help=False)
    copts_parser.add_argument('-v', '--verbose', default=0, action='count', # -vv --> verbose=2
        help='verbose, can be supplied multiple times to increase verbosity.')
    #copts_parser.add_argument('--loglevel', default="ERROR", type=str,
    #    help="Set the loglevel. Possible values: CRITICAL, ERROR (default), WARNING, INFO, DEBUG.")

    # Build the main parser.
    parser = argparse.ArgumentParser(epilog=get_epilog() if with_epilog else "",
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('flowdir', nargs="?", help=("File or directory containing the ABINIT flow/work/task. "
                                                    "If not given, the flow in the current workdir is selected."))
    #parser.add_argument('-V', '--version', action='version', version=abilab.__version__)

    # Create the parsers for the sub-commands
    subparsers = parser.add_subparsers(dest='command', help='sub-command help', description="Valid subcommands")

    # Subparser for new command.
    p_new = subparsers.add_parser('new', parents=[copts_parser], help="Deploy website from scratch.")

    # Subparser for new command.
    p_update = subparsers.add_parser('update', parents=[copts_parser], help="Update tables.")

    # Subparser for rapid command.
    #p_rapid = subparsers.add_parser('rapid', parents=[copts_parser], help="Run all tasks in rapidfire mode.")
    #p_rapid.add_argument('-m', '--max-nlaunch', default=10, type=int,
    #    help="Maximum number of launches. default: 10. Use -1 for no limit.")

    ## Subparser for scheduler command.
    #p_scheduler = subparsers.add_parser('scheduler', parents=[copts_parser],
    #    help="Run all tasks with a Python scheduler. Requires scheduler.yml either in $PWD or ~/.abinit/abipy.")
    #p_scheduler.add_argument('-w', '--weeks', default=0, type=int, help="Number of weeks to wait.")
    #p_scheduler.add_argument('-d', '--days', default=0, type=int, help="Number of days to wait.")

    return parser


def main():

    def show_examples_and_exit(err_msg=None, error_code=1):
        """Display the usage of the script."""
        sys.stderr.write(get_epilog())
        if err_msg: sys.stderr.write("Fatal Error\n" + err_msg + "\n")
        sys.exit(error_code)

    parser = get_parser(with_epilog=True)

    # Parse command line.
    try:
        options = parser.parse_args()
    except Exception as exc:
        show_examples_and_exit(error_code=1)

    if not options.command:
        show_examples_and_exit(error_code=1)

    # loglevel is bound to the string value obtained from the command line argument.
    # Convert to upper case to allow the user to specify --loglevel=DEBUG or --loglevel=debug
    #import logging
    #numeric_level = getattr(logging, options.loglevel.upper(), None)
    #if not isinstance(numeric_level, int):
    #    raise ValueError('Invalid log level: %s' % options.loglevel)
    #logging.basicConfig(level=numeric_level)

    if options.verbose > 2:
        print(options)

    #repo = PseudosRepo("foo", "bar")
    #repo.workdir = "ONCVPSP-PBE-SR-PDv0.4"
    #repo.download()
    #repo.setup()
    #return 0

    # Dispatch
    return globals()[options.command](options)


if __name__ == "__main__":
    sys.exit(main())
