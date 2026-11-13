# The dhtech fork

This is [Yopass](https://github.com/jhaals/yopass) as DreamHack's tech
crew runs it (otp.tech.dreamhack.se). Branch `dhtech` is upstream's
release tag with a small set of changes on top; `master` follows
upstream untouched.

## What is different

Only the look, and only in the web page:

- `website/src/shared/styles/dhtech.css`: the two default themes
  (`emerald`, `dim`) repainted in DreamHack's orange (#FF7801) on
  black; behind the card the tile grid of DreamHack's classic logo - a
  floor of orange tiles that flows up into a point
  (`website/public/dhtech-warp.svg`, drawn by
  `website/scripts/dhtech-warp.mjs`); notices are panels with a line
  of their colour instead of solid blocks, and a warning is amber. The
  theme names are upstream's, so no server, flag or test knows about
  it.
- `website/public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png`:
  our mark.
- `website/src/shared/components/Navbar.tsx`: our mark and name where
  upstream shows its wordmark, when no branding is configured.
- `website/index.html`: the page's title.
- `website/src/app/App.tsx`, `SettingsMenu.tsx`: the credit to Yopass
  ("(c) 2014-<year> Yopass", with its link) is in the settings menu
  instead of the footer; the footer is only there when a privacy
  notice or an imprint is configured.

The server is upstream's, byte for byte. Its licence check is not
touched: the options upstream sells with a licence (branding by flag,
OIDC, audit log, larger files, read receipts, webhooks, secret
requests) stay locked here exactly as upstream ships them.

## Releases

A tag `vX.Y.Z-dhN` on this branch (X.Y.Z = the upstream release it is
cut from) runs `.github/workflows/dhtech-release.yml`: upstream's
server tests, the web page's unit tests, then the container image as a
file on a GitHub release - `yopass_X.Y.Z-dhN_linux_amd64.tar.gz`, an
archive for `podman load`, the image in it named
`localhost/yopass:X.Y.Z-dhN`. Nothing goes to a registry.

## A new upstream release

    git fetch upstream --tags
    git rebase --onto <new tag> <old tag> dhtech
    git tag v<new tag>-dh1 && git push origin dhtech v<new tag>-dh1
