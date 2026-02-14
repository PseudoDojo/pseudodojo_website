#!/usr/bin/env python
from __future__ import annotations

import sys
import os
import time
import tempfile
import argparse
import abc
import json
import shutil
import subprocess

from pathlib import Path
from collections import defaultdict
from multiprocessing import Pool, cpu_count
#from tqdm import tqdm
from pymatgen.io.abinit.pseudos import Pseudo, PawXmlSetup
from abipy.flowtk.psrepos import download_repo_from_url  # md5_for_filepath

from html_tools import write_html_from_oncvpsp_outpath, write_html_from_jth_xml


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


def write_and_run_script(target_dir: str, repo: str, subdir: str) -> None:
    target_dir = Path(target_dir).resolve()
    print(f"Cloning {repo=}, in {subdir=}\nworking in {target_dir}")

    #REPO="https://github.com/abinit/paw_jth_datasets.git"
    #SUBDIR="pseudos/JTH-PBE-v2.0"

    script_content = """#!/usr/bin/env bash
set -euo pipefail
#set -x

TARGET_DIR="$1"
REPO="$2"
SUBDIR="$3"

# Ensure target directory exists
mkdir -p "$TARGET_DIR"

# Clone inside target directory
git clone --depth=1 --filter=blob:none --sparse "$REPO" "$TARGET_DIR/paw_jth_datasets"

cd "$TARGET_DIR/paw_jth_datasets"

git sparse-checkout set "$SUBDIR"

#git clone --depth=1 --filter=blob:none --sparse https://github.com/abinit/paw_jth_datasets.git
#cd paw_jth_datasets
#git sparse-checkout set pseudos/JTH-PBE-v2.0
"""
    # TODO: Should use tmp file
    script_path = "clone_" + subdir.replace("/", "_")
    script_path = Path("clone_sparse.sh").resolve()

    # Write script to file and make it executable
    script_path.write_text(script_content)
    os.chmod(script_path, 0o755)

    # Run it
    subprocess.run(
        [str(script_path), str(target_dir), str(repo), str(subdir)],
        check=True,
    )


# These two functions must have the same prototype.

def make_oncv_html(dirpath, prefix, from_scratch):
    """
    Generate the HTML file with the oncvps results and the validation results
    read from a json file placed in the same directory as the pseudo.

    Args:
        dirpath: Path to the directory with the pseudo.
        prefix:
        from_scratch:
    """
    # TODO: Generate HTML files from the djrepo file.

    # Typical structure of a ONCV subdirectory.
    # Ag:
    #   Ag-sp.djrepo
    #   Ag-sp.in
    #   Ag-sp.out
    #   Ag-sp.psp8

    #print(f"{dirpath=}, {prefix=}")
    out_path = os.path.join(dirpath, prefix + ".out")
    html_path = os.path.join(dirpath, prefix + ".html")
    if not from_scratch and os.path.exists(html_path):
        print(f"Won't regenerate HTML file: {html_path=}")
        return

    return write_html_from_oncvpsp_outpath(out_path)


def make_atompaw_html(dirpath, prefix, from_scratch):
    """
    Generate the HTML file with the JTH results and the validation results
    read from a json file placed in the same directory as the pseudo.

    Args:
        dirpath: Path to the directory with the pseudo.
        prefix:
        from_scratch:
    """
    # Typical structure of a JTH subdirectory
    #
    #  Ag:
    #    Ag.GGA_PBE-JTH.UPF
    #    Ag.GGA_PBE-JTH.atompaw.input
    #    Ag.GGA_PBE-JTH.corewf.xml
    #    Ag.GGA_PBE-JTH.xml
    #    Ag.GGA_PBE-JTH_light.atompaw.input
    #    Ag.GGA_PBE-JTH_light.xml
    #    README.md

    #print(f"{dirpath=}, {prefix=}")
    # dirpath='./tables/ATOMPAW-PBE-JTHv2.0', prefix='Ag/Ag.GGA_PBE-JTH'

    xml_path = os.path.join(dirpath, prefix) + ".xml"

    elm, prefix = prefix.split("/") # -> Ag, Ag.GGA_PBE-JTH
    if elm not in ALL_ELEMENTS:
        raise ValueError(f"Invalid element {elm}")

    html_path = os.path.join(dirpath, prefix + ".html")
    if not from_scratch and os.path.exists(html_path):
        print(f"Won't regenerate HTML file: {html_path=}")
        return

    return write_html_from_jth_xml(xml_path)


class PseudosRepo(abc.ABC):
    """
    Base abstract class for a github repository containing pseudopotentials generated
    with the same XC functional and the same treatment of relativistic effects.
    """

    def __init__(self, ps_generator: str, xc_name: str, relativity_type: str, project_name: str,
                 version: str, url: str):
        """
        Args:
            ps_generator: Name of the pseudopotential generator.
            xc_name: XC functional.
            relativity_type: SR for scalar-relativistic or FR for fully relativistic.
            project_name: Name of the project associated to this repository.
            version: Version string.
            url: URL from which the targz will be fetched.
        """
        if relativity_type not in {"SR", "FR"}:
            raise ValueError(f"Invalid {relativity_type=}. It should be in ['SR', 'FR']")

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

    def setup(self, workdir: str, from_scratch: bool) -> None:
        """
        Perform the initialization step:

            1) Download the tarball from the github url, unpack it and save it in the self.name directory.
            2) Build list of tables by extracting the relative paths from the `table_name.txt` files.
               found in the top-level directory and build self.tables
            3) Create targz files with all pseudos associated to a given table.
        """
        doit = from_scratch or (not from_scratch and not os.path.isdir(self.name))
        self.path = os.path.join(workdir, self.name)
        start = time.perf_counter()

        if doit:
            # Fetch data from github and copy data to self.path
            self.download_to(self.path)
        else:
            print("Skipping download step as", self.path, "directory already exists")

        # Find the .txt files defining the tables provided by this repo.
        excluded = {
            "dataset_info.txt",  # JTH
        }

        table_paths = [f for f in os.listdir(self.path) if f.endswith(".txt") and f not in excluded]
        table_paths = [os.path.join(self.path, t) for t in table_paths]
        if not table_paths:
            raise RuntimeError("Cannot find .txt files with list of pseudos. Likely PAW table.")

        # Get the list of table names from `table_name.txt`
        relpaths_table = {}
        for table_path in table_paths:
            table_name, _ = os.path.splitext(os.path.basename(table_path))
            with open(table_path, "r") as fh:
                rps = [f.strip() for f in fh.readlines() if f.strip()]
                relpaths_table[table_name] = [os.path.splitext(p)[0] for p in rps]

        # Preparing args required to build HTML pages.
        unique_paths = sorted(set(p for l in relpaths_table.values() for p in l))
        nprocs = max(1, cpu_count() // 2)
        nprocs = 1

        if self.ps_generator == "ONCVPSP":
            function = make_oncv_html
        elif self.ps_generator == "ATOMPAW":
            function = make_atompaw_html

        with_html = True
        if with_html:
            print(f"Building HTML pages with {nprocs=} ...")
            html_start = time.perf_counter()

            if nprocs == 1:
                # This is not parallelized but debugging is easier.
                for prefix in unique_paths:
                    function(self.path, prefix, from_scratch)

            else:
              # Using pool to speedup execution. Prepare argument tuples
              arg_tuples = [(self.path, prefix, from_scratch) for prefix in unique_paths]
              with Pool(processes=nprocs) as pool:
                  pool.starmap(function, arg_tuples)

            print(f"html build. elapsed time: {time.perf_counter() - html_start:.6f} seconds\n")

        # Build dictionary: tables[name][file_ext] -> files
        self.tables = defaultdict(dict)
        for table_name, relpaths in relpaths_table.items():
            for ext in self.formats:
                all_files = [os.path.join(self.path, f"{rpath}.{ext}") for rpath in relpaths]
                files = list(filter(os.path.isfile, all_files))
                if len(files) != len(all_files):
                    print(f"{table_path} WARNING: cannot find files with ext: {ext}.",
                          f"expected: {len(all_files)}, found: {len(files)}")
                self.tables[table_name][ext] = files
                #print("table:", table_name, "ext:", ext, "\n", self.tables[table_name][ext])

        # Build targz file with all pseudos belonging to table_name so that the user can download it via the web interface.
        # This part is slow but we do it only once.
        import tarfile
        self.targz = defaultdict(dict)

        for table_name, table in self.tables.items():
            for ext, rpaths in table.items():
                if not rpaths: continue
                tar_path = os.path.join(self.path, f"{self.type}_{self.xc_name}_{table_name}_{ext}.tgz")
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

        print(f"setup elapsed time: {time.perf_counter() - start:.6f} seconds\n")


class OncvpspRepo(PseudosRepo):
    """
    A repository of pseudos generated with oncvpsp.
    """
    @classmethod
    def from_github(cls, xc_name: str, relativity_type: str, version: str) -> OncvpspRepo:
        """
        Build a OncvpsRepo from a github repository.
        """
        ps_generator, project_name = "ONCVPSP", "PD"

        if relativity_type == "FR":
            # https://github.com/PseudoDojo/ONCVPSP-PBE-FR-PDv0.4/archive/refs/heads/master.zip
            sub_url = f"{ps_generator}-{xc_name}-FR-{project_name}v{version}"
        elif relativity_type == "SR":
            # https://github.com/PseudoDojo/ONCVPSP-PBE-PDv0.4/archive/refs/heads/master.zip
            sub_url = f"{ps_generator}-{xc_name}-{project_name}v{version}"
        else:
            raise ValueError(f"Invalid {relativity_type=}")

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
    def formats(self) -> list[str]:
        """List of file formats provided by the repository."""
        return ["psp8", "upf", "psml", "html", "djrepo"]

    def download_to(self, path: str) -> None:
        """Get the targz from github and unpack it inside directory `path`."""
        print("Downloading onvpsp pseudos from:", self.url, "to:", self.path)
        download_repo_from_url(self.url, self.path)

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
    """
    A repository of pseudos generated with atompaw.
    """

    @classmethod
    def from_github(cls, xc_name: str, relativity_type: str, version: str) -> OncvpspRepo:
        """
        Build a JthRepo assuming a github repository.
        """
        ps_generator, project_name = "ATOMPAW", "JTH"

        if relativity_type != "SR":
            raise ValueError("PAW pseudos with {relativity_type=} are not supported")

        # https://github.com/abinit/paw_jth_datasets/tree/main/pseudos/JTH-PBE-v2.0
        url = f"https://github.com/abinit/paw_jth_datasets/tree/main/pseudos/JTH-{xc_name}-v{version}"
        return cls(ps_generator, xc_name, relativity_type, project_name, version, url)

    def download_to(self, path: str) -> None:
        # JTH use a single repository with all the versions and functionals.
        # Here we clone the repo in a temp directory, sparse-checkout the subdirectory
        # with the pseudos and copy the content inside `path`
        # Directory is deleted automatically on exit

        #tmp_dir = tempfile.mkdtemp(prefix="paw_clone_"))
        with tempfile.TemporaryDirectory() as tmp_dir:
            repo = "https://github.com/abinit/paw_jth_datasets.git"
            subdir = f"pseudos/JTH-{self.xc_name}-v{self.version}"
            write_and_run_script(tmp_dir, repo, subdir)
            src = os.path.join(tmp_dir, "paw_jth_datasets", subdir)
            shutil.copytree(src, path, dirs_exist_ok=True)

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
        if self.relativity_type == "FR":
            return f"jth-fr-v{self.version}"
        elif self.relativity_type == "SR":
            return f"jth-sr-v{self.version}"
        else:
            raise ValueError(f"Invalid relativity_type {self.relativity_type}")

    @property
    def formats(self) -> list[str]:
        """List of file formats provided by the repository."""
        return ["xml", "UPF", "html"]
        #return ["xml", "UPF", "html", "djrepo"]

    def get_meta_from_pawxml(self, path: str) -> dict:
        pseudo = PawXmlSetup(path)
        meta = {
            "nv": pseudo.valence,
        }

        e = pseudo.root.find("pw_ecut")
        if e is None:
            print("Cannot find hints (pw_ecut) in:", path)
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
    files[typ][xc_name][table_name][elm][fmt]
    targz[typ][xc_name][table_name][fmt]
    """

    def __init__(self, path: str, verbose: int) -> None:
        #self.path = os.path.abspath(path)
        self.path = path
        self.verbose = verbose

        # Create list of repositories.
        _mk_onc = OncvpspRepo.from_github
        _mk_jth = JthRepo.from_github

        self.repos = [
            # ONCVPSP repositories.
            #_mk_onc(xc_name="PBEsol", relativity_type="SR", version="0.4"),
            #_mk_onc(xc_name="PBEsol", relativity_type="FR", version="0.4"),
            #_mk_onc(xc_name="PBE", relativity_type="SR", version="0.4"),
            #_mk_onc(xc_name="PBE", relativity_type="FR", version="0.4"),  FIXME: checksum fails
            #
            # JTH repositories.
            #
            # FIXME: These repos do no provide .txt files with pseudo list e.g. standard.txt, stringent
            # so we temporarily disable them.
            _mk_jth(xc_name="PBE", relativity_type="SR", version="2.0"),
            #_mk_jth(xc_name="LDA", relativity_type="SR", version="2.0"),
        ]

    def build(self, from_scratch: bool) -> None:
        print(f"Building static website with {from_scratch=}")

        # files[typ][xc_name][table_name][elm][fmt]
        # targz[typ][xc_name][table_name][fmt]
        files = defaultdict(dict)
        targz = defaultdict(dict)

        tables_dirpath = os.path.join(self.path, "tables")

        if from_scratch:
            print(f"Removing {tables_dirpath} directory since {from_scratch=}")
            shutil.rmtree(tables_dirpath, ignore_errors=True)

        if not os.path.isdir(tables_dirpath):
            os.mkdir(tables_dirpath)

        for repo in self.repos:
            repo.setup(tables_dirpath, from_scratch)
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
                        p = os.path.relpath(repo.targz[table_name][fmt], start=self.path)
                        targz[repo.type][repo.xc_name][table_name][fmt] = p

                    for rpath in rpaths:

                        if repo.ps_generator == "ONCVPSP":
                            # Get the element symbol from the relative path.
                            # e.g. ONCVPSP-PBE-SR-PDv0.4/Ag/Ag-sp.psp8
                            elm = rpath.split(os.sep)[-2]

                            if fmt == "djrepo":
                                # Get hints from the djrepo file if NC pseudo.
                                meta = repo.get_meta_from_djrepo(rpath)
                                files[repo.type][repo.xc_name][table_name][elm]["meta"] = meta

                        elif repo.ps_generator == "ATOMPAW":
                            # Get the element symbol from the relative path.
                            # e.g. ATOMICDATA/Ag.LDA_PW-JTH.xml
                            elm = os.path.basename(rpath).split(".")[0]

                            if fmt == "xml":
                                # Extract hints from PAW xml
                                meta = repo.get_meta_from_pawxml(rpath)
                                files[repo.type][repo.xc_name][table_name][elm]["meta"] = meta

                        else:
                            raise ValueError(f"Invalid value for repo.ps_generator: {repo.ps_generator}")

                        if elm not in ALL_ELEMENTS:
                            raise ValueError(f"Invalid element symbol: `{elm}`")

                        files[repo.type][repo.xc_name][table_name][elm][fmt] = rpath

        print("\nWriting files.json and targz.json")
        workdir = os.path.join(self.path, "json")
        if not os.path.isdir(workdir):
            os.mkdir(workdir)

        with open(os.path.join(workdir, "files.json"), "w") as fh:
            json.dump(files, fh, indent=2, sort_keys=True)

        with open(os.path.join(workdir, "targz.json"), "w") as fh:
            json.dump(targz, fh, indent=2, sort_keys=True)

        print("Rember to execute `serve.sh` to test the web-server!")

    #def check(self) -> None:


def new(options) -> int:
    """
    Deploy new website in the current working directory.
    1) download tables from github
    2) generate new json files
    """
    website = Website(".", options.verbose)
    website.build(from_scratch=True)
    return 0


def update(options) -> int:
    """
    Update a pre-existent installation.
    """
    website = Website(".", options.verbose)
    website.build(from_scratch=False)
    return 0



def get_epilog() -> str:
    usage = """\

Usage example:

  deploy.py new     =>  Upload git repos and deploy website from scratch.
  deploy.py update  =>  Update git repos and a pre-existent website.
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
    #parser.add_argument('-V', '--version', action='version', version=abilab.__version__)

    # Create the parsers for the sub-commands
    subparsers = parser.add_subparsers(dest='command', help='sub-command help', description="Valid subcommands")

    # Subparser for new command.
    p_new = subparsers.add_parser('new', parents=[copts_parser],
                                  help="Upload git repos and deploy website from scratch.")

    # Subparser for update command.
    p_update = subparsers.add_parser('update', parents=[copts_parser],
                                     help="Update git repos and a pre-existent website.")

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

    # Dispatch
    return globals()[options.command](options)


if __name__ == "__main__":
    sys.exit(main())
