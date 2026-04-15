{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
    pkgs.typescript
  ];
  idx = {
    extensions = [
      "vscode-icons-team.vscode-icons"
      "esbenp.prettier-vscode"
    ];
    workspace = {
      onCreate = {
        npm-install = "cd backend && npm install";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["./cli/adm.js"];
          manager = "web";
        };
      };
    };
  };
}
