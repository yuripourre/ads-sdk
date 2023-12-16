# zesty-billboard

The Zesty Billboard SDK allows developers to integrate their app into the Zesty Network. More docs: https://zestyxyz.notion.site/Zesty-Market-Documentation-346d6f9aa8544cf9a5484c3ccf61523a

Currently, we support the following platforms:

- [aframe](https://github.com/zestymarket/billboard/tree/main/aframe)
- [babylon.js](https://github.com/zestymarket/billboard/tree/main/babylonjs)
- [react-three-fiber](https://github.com/zestymarket/billboard/tree/main/r3f)
- [three.js](https://github.com/zestymarket/billboard/tree/main/threejs)
- [web](https://github.com/zestymarket/billboard/tree/main/web)
- [wonderland](https://github.com/zestymarket/billboard/tree/main/wonderland)

## What's Zesty?

Zesty is an open and permissionless monetization protocol for creators of content. It is open in the sense that anyone can integrate our SDK to monetize their apps, without the permission of a centralized authority.

## Getting Started

- Clone the repo and run `yarn` at the top level. This repo is set up with yarn workspaces, so doing this will install modules for all of the different SDKs.
- Work on whichever SDKs are relevant to you.
- Run `yarn build` at the top level to build all the SDKs at once.
- Run `yarn test` to run unit tests.
  - (Optional) Run `yarn prepare` to set up a pre-commit hook to run tests.

## Publishing to NPM

If you've developed a new framework SDK and want to publish it to NPM, the steps are as follows:

- Ensure you are a member of the zestymarket org on NPM.
- Ensure that the name in the package.json for the SDK follows the `@zestymarket/<framework>-sdk` format.
- In the directory for that SDK, run `npm publish --access public` and the SDK will be published to the zestymarket NPM org.
