{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-23.11";
  };

  outputs = { self, nixpkgs }: with nixpkgs.legacyPackages.x86_64-linux;
    {
      devShell.x86_64-linux = mkShellNoCC {
        buildInputs = [
          bun
        ];
      };
    };
}
