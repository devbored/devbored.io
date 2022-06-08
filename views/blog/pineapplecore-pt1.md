## Building a RISC-V CPU from scratch 🍍 - Part 1
06/08/22

In the past, I have written a few different CPU cores (each one learning from the prior designs):
- A single-cycle non-pipelined MIPS core (Seems I lost the source code for this one)
- [dlxtreme](https://github.com/devbored/dlxtreme): A multi-cycle non-pipelined DLX core
- [mipyfive](https://github.com/devbored/mipyfive): A 5-stage pipelined RISC-V core

These cores were mainly driven by pedagogical reasons (a learning exercise for me). The real motivation I have
now is to implement another CPU core with the explicit goal of *using it in real hardware* for various embedded
projects.

So I started working on `pineapplecore` a RISC-V CPU from scratch.

This 1st post will cover the motivation, design, and project setup (i.e. overview of tools).

### Motivation 🤔
So why design a CPU from scratch?

Other than the lame answer of **because-it's-cool**™️, there are quite a few practical
reasons behind doing so - especially if one regularly does embedded projects:

- Full design **control** over CPU and its implemented instructions and extensions
    - Especially for a modular and open instruction set architecture (ISA) like RISC-V that defines base ISA and
      optional extensions on top of that
    - One can also define their own *custom* instructions when designing their own CPU (lots of possibilities here)
    - Full control over how simple or complex you want your design to be
- When designing a microcontroller or SoC for your soft-cpu, **choose** or **design** the peripherals (I/O) you want
    - Compare this to shopping around for a microcontroller and find one that generally fits your requirements
        - Often times end up with unused peripherals -
          or not enough of a particular peripheral usually realized at the last minute of a project ... oops 😅
        - Or if you have a very niche/custom interface with some external component, standard peripherals might not
          cut it
        - And emulating the interface over general-purpose I/O (GPIO) (i.e. bit-banging) will likely not be fast enough
          either
- SoC or microcontroller CPU micro-architecture can be **scaled** over time
    - Want to dabble with a multi-core CPU design? Go for it!
    - Enhance the single core performance by looking into adding superscalar or Out-of-Order (OoO) execution for example
    - Enhancements even at lower-levels (e.g. different adder/mult/div hardware algorithms)

There are probably more highlights here, but I find these to be the most compelling reasons.

### Design 📊
With that, here's what I came up with for the CPU design:

- Use RISC-V for the core's ISA
    - The ISA is open meaning no licensing fees for custom designs
    - Being a modular ISA, we can start with the base `RV32I` ISA here (32-bit Integer)
    - Cross-Compiler toolchain is fairly robust at this point (GCC 11 support - nice!)
- Design a 4-stage pipelined soft-cpu
    - Stages being: `Fetch/Decode` -> `Execute` -> `Memory` -> `Writeback`
    - Simple branch prediction for now (static "assume-not-taken"), explore dynamic predictors later
    - In-order design for now

The idea for the first-go is to keep things simple, then expand later.

### Project Setup 🛠️
Here's the breakdown of the flow I have set-up (for now):

- `GNU Make`: for the build tool
    - Simple and flexible for generic commands
- `iverilog`: as the unit-test simulator
    - A FOSS event-driven Verilog simulator (also allows non-synthesizable Verilog constructs for more testing aid)
- `Python`: for generating test_vectors for the tests
- `riscv64-unknown-elf-gcc`: for the C/C++ cross-compiler
- `Docker`: for an easy-mode way to contain riscv cross-compiler in a container
- `GTKWave`: Tool to view signals of simulation runs graphically

Will likely explore using `Verilator` for a full CPU test simulation as well as `SymbiYosys`, `Yosys`, and `z3` to
perform formal verification on certain critical components (i.e. bus logic, arithmetic circuits, etc.). Will have
another post exploring these later.

### What's next? 🎯
The next post in this series will take a look at designing/coding the `Fetch/Decode` stage of the CPU.

### Where's the code?! 👀
Here's the GitHub link to [pineapplecore](https://github.com/devbored/pineapplecore). The code/design is mostly
complete at the time of writing, but I still encourage those to take a look even before the next posts are published.
