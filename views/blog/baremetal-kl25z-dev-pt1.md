# Baremetal KL25Z Development - Part 1
02/06/20

![kl25zBoard](images/kl25z.jpg)

The FRDM-KL25Z is an excellent ARM Cortex M0+ development board
from NXP and I have used it quite a bit in many of my personal
and school-related projects. At the time, I did not have the
knowledge of setting up a baremetal development environment
for the board, so instead I had to settle for using the CodeWarrior
Integrated Development Environment (IDE), and to be honest I disliked
using every minute of it. When I later realized it was basically a
"skin" of the Eclipse IDE, it suddenly made sense why 😉.

Now, the reasons why I personally tend to dislike IDEs (especially for
embedded development) is that they are often too bloated with unnecessary
auto-generation wizards and they often hide too much detail from the developer for
the sake of being "user-friendly". So instead of going down that route, this
blog post (in a multi-part-series) will describe how to setup your own
baremetal development environment for the FRDM-KL25Z board. Lets get started!

## Initial set-up
In this first blog post, we will be downloading and building our toolchain.
Requirements for the host OS can be either Linux, macOS, or Windows 10. Mac
users might need to download homebrew so that they have a package manager and
Windows 10 users can use Windows Subsystem for Linux aka WSL (If there is later
an OS-specific step, I will make sure to bring it up at that point in the blog
post).

Now, lets look at the list of prerequisite software we need prior to building
the toolchain:
- Some C compiler (GCC or Clang should suffice)
- [Git]("https://en.wikipedia.org/wiki/Git")
- [Make]("https://en.wikipedia.org/wiki/Make_(software)")
- [libtool]("https://en.wikipedia.org/wiki/GNU_Libtool")
- [pkg-config]("https://en.wikipedia.org/wiki/Pkg-config")
- [autoconf]("https://en.wikipedia.org/wiki/Autoconf")
- [automake]("https://en.wikipedia.org/wiki/Automake")
- [texinfo]("https://en.wikipedia.org/wiki/Texinfo")

We can just use a package manager for this part:
```Bash
    # Example for Ubuntu or WSL users
    $ sudo apt install gcc git make libtool pkg-config autoconf automake texinfo

    # Example for macOS users using homebrew
    $ brew install gcc git make libtool pkg-config autoconf automake texinfo
```

## Downloading and building the toolchain 🛠️

With the pre-requisites out of the way, lets look at what kinds of tools in the toolchain we will be downloading and building:

- Binutils : Contains the GNU assembler, linker, etc. We will cross-compile this for arm-none-eabi
- GCC : Contains the C/C++ compiler. We will cross-compile this for arm-none-eabi
- Newlib : An implementation of the C library specifically for embedded systems
- GDB : Contains the C/C++ debugger. We will cross-compile this for arm-none-eabi
- OpenOCD : A free and open-source tool that can program and debug many different target processors.

(FYI: Each of the list items is a hyperlink to their respective download page for convenience)

## Binutils
Let's start with downloading and building Binutils. The Binutils link will take you to the FTP site to download
the tool. Download the tarball (i.e. tar.gz) version that you want to use (I downloaded the
**binutils-2.31.tar.gz** if you want to follow along). It would also be a good optional idea to download and use the
**.sig** file to verify the integrity of the downloaded file using GNU GPG but this is an optional step.


Now, building Binutils is fairly straightforward using the automake tool. We will do an out-of-source build by
creating and going into a 'build' directory, then specify build options to the Automake configure script.
For brevity, we will focus on 3 main build options "prefix", "bindir", and "target". The "prefix" option
tells automake where you want the built binaries installed-to during the "make install-strip" step (it
will default to **/usr/local** if left undefined). The "bindir" option tells automake which directory to
install the user executables to. And the "target" option tells automake which target processor to build Binutils
for. I personally like having the Binutil tool items in the **/opt/arm-none-eabi** folder and the Binutil
user executables in the **/opt/bin** folder on my machine but you can modify this setup if you want to. After
running the configure script, Automake will then configure a Makefile based on your "configure" options.

If you want to follow along exactly what I did, here's what that looks like:
```Bash
    # Downloading "binutils-2.31.tar.gz"
    $ wget https://ftp.gnu.org/gnu/binutils/binutils-2.31.tar.gz

    # OPTIONAL: Downloading Gnu keyring and Binutils signature file, then use Gnu Gpg to verify download
    $ wget https://ftp.gnu.org/gnu/gnu-keyring.gpg
    $ wget https://ftp.gnu.org/gnu/binutils/binutils-2.31.tar.gz.sig
    $ gpg --verify --keyring ./gnu-keyring.gpg ./binutils-2.31.tar.gz.sig
    $ rm ./gnu-keyring.gpg ./binutils-2.31.tar.gz.sig

    # Decompress and unarchive the tarball
    $ tar -xvzf binutils-2.31.tar.gz

    # Cleanup
    $ rm ./binutils-2.31.tar.gz

    # Enter root of the Binutils folder
    $ cd binutils-2.31

    # Create a 'build' directory and 'cd' into it
    $ mkdir build && cd build

    # Specify build options to the automake configure stript
    # We are targeting the ARM Cortex M0+, so we choose "arm-none-eabi" for the target
    $ ../configure --prefix=/opt/arm-none-eabi --bindir=/opt/bin --target=arm-none-eabi

    # Run the generated Makefile (Perfect time to grab a cup of coffee... ☕)
    # If you have a multi-core/multi-threaded processor, use -j to run Make using Paralel Execution
    # (i.e. "-j 4" will spawn 4 parallel 'jobs', the compile time will be significantly faster)
    $ make -j 4

    # After Make completes, "install" the built Binutil tools then leave the Binutils root directory
    $ sudo make install-strip
    $ cd ../..
```

## GCC & Newlib
That takes care of Binutils so lets move onto GCC & Newlib. When you click on the Newlib hyperlink from the toolchain
list above, go ahead and save the "index" HTML file somewhere on your computer. Once downloaded, open it in a web
browser to get access to the Newlib tarballs (I downloaded the **newlib-3.3.0.tar.gz** if you want to follow along).
The download and decompressing-and-unarchiving of GCC should be the exact same steps as Binutils (I downloaded the
**gcc-7.4.0** if you want to follow along). It would also be a good optional idea to download and use the
**.sig** file to verify the integrity of the downloaded file using GNU GPG but this is an optional step.
The only difference, again, is the "configure" options. If you want to follow along exactly what I did, here's what
that looks like (again you can change/omit the "prefix" and "bindir" options if you wish):

```Bash
    # Decompress and unarchive the tarball - Assuming you already downloaded the Newlib tarball
    $ tar -xvzf newlib-3.3.0.tar.gz

    # Cleanup
    $ rm ./newlib-3.3.0.tar.gz

    # Downloading "gcc-7.4.0.tar.gz"
    $ wget https://ftp.gnu.org/gnu/gcc/gcc-7.4.0/gcc-7.4.0.tar.gz

    # OPTIONAL: Downloading Gnu keyring and Binutils signature file, then use Gnu Gpg to verify download
    $ wget https://ftp.gnu.org/gnu/gnu-keyring.gpg
    $ wget https://ftp.gnu.org/gnu/gcc/gcc-7.4.0.tar.gz.sig
    $ gpg --verify --keyring ./gnu-keyring.gpg ./gcc-7.4.0.tar.gz.sig
    $ rm ./gnu-keyring.gpg ./gcc-7.4.0.tar.gz.sig

    # Decompress and unarchive the tarball
    $ tar -xvzf gcc-7.4.0.tar.gz

    # Cleanup
    $ rm ./gcc-7.4.0.tar.gz

    # Enter root of the GCC folder
    $ cd gcc-7.4.0

    # Run the "download_prerequisites" script
    $ ./contrib/download_prerequisites

    # Create a 'build' directory and 'cd' into it
    $ mkdir build && cd build

    # Specify build options to the automake configure stript
    # We are targeting the ARM Cortex M0+, so we choose "arm-none-eabi" for the target
    # Enable the C and C++ support and disable the Native Language Support (NLS)
    # Build only static libs and target Newlib as C lib
    # Give the full path to Newlib header location
    $ sudo ../configure --target=arm-none-eabi \
      --prefix=/opt/arm-none-eabi --bindir=/opt/bin \
      --enable-languages=c,c++ --disable-nls \
      --disable-shared --with-newlib \
      --with-headers=**&lt;/replace/with/full/path/up/to/newlib-folder&gt;**/newlib-3.3.0/newlib/libc/include

    # Run the generated Makefile (Perfect time to grab a cup of coffee... ☕)
    # If you have a multi-core/multi-threaded processor, use -j to run Make using Paralel Execution
    # (i.e. "-j 4" will spawn 4 parallel 'jobs', the compile time will be significantly faster)
    $ make -j 4

    # After Make completes, "install" the built GCC tools then leave the GCC root directory
    $ sudo make install-strip
    $ cd ../..

    # Now lets build Newlib - Enter root of the Newlib folder
    $ cd newlib-3.3.0

    # Create a 'build' directory and 'cd' into it
    $ mkdir build && cd build

    # Make sure "arm-none-eabi" tools are in the PATH env variable
    # FYI: It's best to put this in a ".bashrc" file (or equivalent) so that this is persistant
    #      (again, **/opt/bin** was based off of my configure script "prefix" value)
    $ export PATH="${PATH}:/opt/bin"

    # Specify build options to the automake configure stript
    # We are targeting the ARM Cortex M0+, so we choose "arm-none-eabi" for the target
    $ ../configure --target=arm-none-eabi --prefix=/opt/arm-none-eabi

    # Run the generated Makefile (Perfect time to grab a cup of coffee... ☕)
    # If you have a multi-core/multi-threaded processor, use -j to run Make using Paralel Execution
    # (i.e. "-j 4" will spawn 4 parallel 'jobs', the compile time will be significantly faster)
    $ make -j 4

    # Leave the Newlib root directory
    $ cd ../..
```
I skipped the "make install" step when building Newlib since I like to keep my C libraries separated from
the toolchain just as my personal preference (I use symlinks to the Newlib headers and libs instead).
But you can do "make install" if you want to.

## GDB
That takes care of GCC so lets move onto GDB. The download and decompressing-and-unarchiving of GDB
should be the exact same steps as Binutils and Newlib (If you want to follow along with me, I use gdb-8.3).
It would also be a good optional idea to download and use the **.sig** file to verify the integrity of the
downloaded file using GNU GPG but this is an optional step. The only difference, again, is the "configure"
options. If you want to follow along exactly what I did, here's what that looks like (again you can change/omit
the "prefix" and "bindir" options if you wish):

```Bash
    # Downloading "gdb-8.3.tar.gz"
    $ wget https://ftp.gnu.org/gnu/gdb/gdb-8.3.tar.gz

    # OPTIONAL: Downloading Gnu keyring and Binutils signature file, then use Gnu Gpg to verify download
    $ wget https://ftp.gnu.org/gnu/gnu-keyring.gpg
    $ wget https://ftp.gnu.org/gnu/gdb/gdb-8.3.tar.gz.sig
    $ gpg --verify --keyring ./gnu-keyring.gpg ./gdb-8.3.tar.gz.sig
    $ rm ./gnu-keyring.gpg ./gdb-8.3.tar.gz.sig

    # Decompress and unarchive the tarball
    $ tar -xvzf gdb-8.3.tar.gz

    # Cleanup
    $ rm ./gdb-8.3.tar.gz

    # Enter root of the GDB folder
    $ cd gdb-8.3

    # Create a 'build' directory and 'cd' into it
    $ mkdir build && cd build

    # Specify build options to the automake configure stript
    # We are targeting the ARM Cortex M0+, so we choose "arm-none-eabi" for the target
    # Enabling the text-user-interface (TUI) mode,
    # this is optional and you need **"libncurses5-dev"** and **"libncursesw5-dev"** if you want to
    # use TUI (you can simply use a package manager for both libs)
    $ ../configure --target=arm-none-eabi \
      --prefix=/opt/arm-none-eabi --enable-tui=yes \
      --bindir=/opt/bin

    # Run the generated Makefile (Perfect time to grab a cup of coffee... ☕)
    # If you have a multi-core/multi-threaded processor, use -j to run Make using Paralel Execution
    # (i.e. "-j 4" will spawn 4 parallel 'jobs', the compile time will be significantly faster)
    $ make -j 4

    # After Make completes, "install" the built GDB tools then leave the GDB root directory
    $ sudo make install
    $ cd ../..
```

## OpenOCD
Almost there! Lastly we need to download and install OpenOCD. Now if you're using Windows like me, we
need a Linux-to-Windows cross-compiler and the hidapi library for OpenOCD to build. The mingw-w64 cross-compiler
will do the trick. The "mingw-w64" cross-compiler can be downloaded via package manager in WSL.

Use the commands in this block if running on **Windows using WSL**, otherwise skip this part:
```Bash
    # OPTIONAL: This step is only for Windows-users
    # (This specific example works for WSL)
    $ sudo apt-get install mingw-w64
```

Now we need to Git clone the hidapi library that OpenOCD uses to comunicate with the ARM CMSIS DAP:
```Bash
    # Git clone the hidapi library
    $ git clone https://github.com/libusb/hidapi.git
```
The easiest way to build the hidapi library on **Windows** is to open the "hidapi.sln" located in the
"windows" folder in the root of the hidapi directory using Visual Studio. Before building, make sure
to retarget the sln to your latest Windows SDK and Toolset, set the release-mode to "Debug" and the
architecture to "x64", then build the "hidapi" project. After building in Visual Studio, you should
have the "hidapi.dll" file in the **hidapi/windows/Debug** folder.

Use the commands in this block if building hidapi on **Linux/macOS**, otherwise skip this part:
```Bash
    # Get prerequisites
    $ sudo apt install libudev-dev libusb-1.0-0-dev

    # Go to root of hidapi directory
    $ cd ./hidapi

    # Build and install the hidapi library
    $ ./bootstrap
    $ mkdir build && cd build
    $ ../configure
    $ make
    $ sudo make install
```

Now, lets download and build OpenOCD.
```Bash
    # Git cloning the v0.10.0 of OpenOCD
    $ git clone https://git.code.sf.net/p/openocd/code openocd-code

    # Enter root of the OpenOCD folder
    # Run the bootstrap script (when building from the git repository)
    $ cd openocd-git
    $ ./bootstrap

    # Create a 'build' directory and 'cd' into it
    $ mkdir build && cd build
```

Use the commands in this block if running on **Windows using WSL**, otherwise skip this part:
```Bash
    # Export the environment variables to the hidapi headers and libs
    $ export HIDAPI_CFLAGS="-I../../hidapi/hidapi"
    $ export HIDAPI_LIBS="-L../../hidapi/windows/x64/Debug -lhidapi"

    # Specify build options to the automake configure stript
    # Disable warnings-as-errors, choose cmsis-dap as target interface
    # Disable documentation gereration
    $ ../configure --prefix=/mnt/c/openocd --host=x86_64-w64-mingw32 --disable-werror \
      --enable-cmsis-dap --disable-doxygen-pdf --build=x86_64-w64-mingw32

    # Run the generated Makefile (Perfect time to grab a cup of coffee... ☕)
    # If you have a multi-core/multi-threaded processor, use -j to run Make using Paralel Execution
    # (i.e. "-j 4" will spawn 4 parallel 'jobs', the compile time will be significantly faster)
    $ make -j 4

    # After Make completes, "install" the built OpenOCD tools
    $ sudo make install

    # Copy the "hidapi.dll" to where the "openocd.exe" is (specified by the "prefix" configure option)
    # Then leave the OpenOCD root directory
    $ cp ../../hidapi/windows/x64/Debug/hidapi.dll /mnt/c/openocd/bin
    $ cd ../..
```

Use the commands in this block if running on **Linux/macOS**, otherwise skip this part:
```Bash
    # Specify build options to the automake configure stript
    # Disable warnings-as-errors, choose cmsis-dap as target interface
    # Disable documentation gereration
    $ ../configure --prefix=/opt/openocd --bindir=/opt/bin --disable-werror \
      --enable-cmsis-dap --disable-doxygen-pdf

    # Run the generated Makefile (Perfect time to grab a cup of coffee... ☕)
    # If you have a multi-core/multi-threaded processor, use -j to run Make using Paralel Execution
    # (i.e. "-j 4" will spawn 4 parallel 'jobs', the compile time will be significantly faster)
    $ make -j 4

    # After Make completes, "install" the built OpenOCD tools
    $ sudo make install

    # You may have to add the "libhidapi-hidraw.so" path to the "LD_LIBRARY_PATH" environment variable
    # if OpenOCD cannot find that library
    # FYI: It's best to put this in a ".bashrc" file (or equivalent) so that this is persistant
    $ export LD_LIBRARY_PATH="${LD_LIBRARY_PATH}:/usr/local/lib"

    # Leave the OpenOCD root directory
    $ cd ../..
```

And with that, we should have all of the tools downloaded and built. The next step is to make sure that
the tools are in your PATH variable so that you can invoke the tools from any directory.
```Bash
    # A quick sanity-test of printing the version of the arm-none-eabi-gcc cross-compiler
    $ arm-none-eabi-gcc --version
    arm-none-eabi-gcc (GCC) 7.4.0
    Copyright (C) 2017 Free Software Foundation, Inc.
    This is free software; see the source for copying conditions.  There is NO
    warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

    # A quick sanity-test of printing the version of the arm-none-eabi-gdb debugger
    $ arm-none-eabi-gdb --version
    GNU gdb (GDB) 8.3
    Copyright (C) 2019 Free Software Foundation, Inc.
    License GPLv3+: GNU GPL version 3 or later &lt;http://gnu.org/licenses/gpl.html&gt;&lt;/http:&gt;
    This is free software; see the source for copying conditions.  There is NO
    warranty; not even for MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

    # A quick sanity-test of printing the version of OpenOCD (on Windows)
    $ openocd.exe --version
    Open On-Chip Debugger 0.10.0+dev-01047-g09ac9ab1 (2020-01-29-17:47)
    Licensed under GNU GPL v2
    For bug reports, read
        http://openocd.org/doc/doxygen/bugs.html

    # A quick sanity-test of printing the version of OpenOCD (on Linux/macOS)
    $ sudo openocd --version
    Open On-Chip Debugger 0.10.0+dev-01047-g09ac9ab1 (2020-01-29-17:47)
    Licensed under GNU GPL v2
    For bug reports, read
        http://openocd.org/doc/doxygen/bugs.html
```

We have sucessfully downloaded and built the toolchain. This now concludes part 1 of this
Baremetal KL25Z Development series. In part 2, we will look at the following things:
- The KL25Z and the ARM Cortex M0+ core in more detail
- Write our own startup code and linker scripts for the KL25Z

Until next time! 👋