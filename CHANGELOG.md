# Changelog

### [1.11.5](https://www.github.com/shufo/blade-formatter/compare/v1.11.4...v1.11.5) (2021-04-18)


### Bug Fixes

* 🐛 `[@forelse](https://www.github.com/forelse)` inside `[@if](https://www.github.com/if)` gets unexpected indentation [#254](https://www.github.com/shufo/blade-formatter/issues/254) ([fbde357](https://www.github.com/shufo/blade-formatter/commit/fbde357d66aa2ec64eaf9511d9199efef634df42))

### [1.11.4](https://www.github.com/shufo/blade-formatter/compare/v1.11.3...v1.11.4) (2021-04-11)


### Bug Fixes

* format inline directive in script tag ([86758cb](https://www.github.com/shufo/blade-formatter/commit/86758cbeeb69745cceb0a6a7050aff7bd052f378))

### [1.11.3](https://www.github.com/shufo/blade-formatter/compare/v1.11.2...v1.11.3) (2021-04-10)


### Bug Fixes

* 🐛 indent body inside case directive [#209](https://www.github.com/shufo/blade-formatter/issues/209) ([#247](https://www.github.com/shufo/blade-formatter/issues/247)) ([ff04965](https://www.github.com/shufo/blade-formatter/commit/ff04965cfacff3f9cd597e1d4fb1ede1accdac31))

### [1.11.2](https://www.github.com/shufo/blade-formatter/compare/v1.11.1...v1.11.2) (2021-04-06)


### Bug Fixes

* 🐛 break chained method in directive ([4e4b3bf](https://www.github.com/shufo/blade-formatter/commit/4e4b3bfe6534bcfd59f89c42860798a5e8bff9a8))



### [1.11.1](https://www.github.com/shufo/blade-formatter/compare/v1.11.0...v1.11.1) (2021-04-04)


### Bug Fixes

* 🐛 adjust indent level for directive in scripts ([a94cee2](https://www.github.com/shufo/blade-formatter/commit/a94cee290a9bed0c8eb1098ddec4b5f190cd2eb6))

## [1.11.0](https://www.github.com/shufo/blade-formatter/compare/v1.10.7...v1.11.0) (2021-04-03)


### Features

* 🎸 add support for [@canany](https://www.github.com/canany), [@cannot](https://www.github.com/cannot) directive ([fa50534](https://www.github.com/shufo/blade-formatter/commit/fa505346da4abfbb9c39ed9cd13aeafed2e34f77))

### [1.10.7](https://github.com/shufo/blade-formatter/compare/v1.10.6...v1.10.7) (2021-04-02)


### Bug Fixes

* 🐛 blade directives inside script tag causes error ([0696d3c](https://github.com/shufo/blade-formatter/commit/0696d3c6727e9fcde7f7690bf795e44bc333597c))
* 🐛 change list order to match foreach directive first ([f7b388e](https://github.com/shufo/blade-formatter/commit/f7b388e2791047541105b84e9079a2d7f72f7327))
* 🐛 explicitly specify dependency version ([00ea4ce](https://github.com/shufo/blade-formatter/commit/00ea4ce2a3289992527df3856521720863059c5c))
* 🐛 match case insensitive for directives ([ecf4097](https://github.com/shufo/blade-formatter/commit/ecf40978211beef042213e15c47b4c618290e05c))
* 🐛 use forked commit hash to fix version ([7c623f2](https://github.com/shufo/blade-formatter/commit/7c623f2792b1a302c9937b9b749429f48f76751e))


### Features

* 🎸 add aigle and xregexp to dependencies ([d0eee99](https://github.com/shufo/blade-formatter/commit/d0eee99574ac82486eabf4e52db30a44b70d008d))
* 🎸 add indent utility ([78be41c](https://github.com/shufo/blade-formatter/commit/78be41c1bc7f53922ca9111dca301bb51b6651bd))


### Performance Improvements

* ⚡️ run cli test concurrently ([abf84a7](https://github.com/shufo/blade-formatter/commit/abf84a7368a8f2374717cd796dc091fb364d1efd))


### Reverts

* Revert "chore: 🤖 Release 1.10.7" ([23e00fd](https://github.com/shufo/blade-formatter/commit/23e00fd17435ec3b0e37f7490e34aba3ef08f79b))




### [1.10.6](https://github.com/shufo/blade-formatter/compare/v1.10.5...v1.10.6) (2021-03-31)


### Bug Fixes

* 🐛 use back-up commit ([c758f6a](https://github.com/shufo/blade-formatter/commit/c758f6af8558cd0f58e7af8718a47eba102ef203))


### Features

* 🎸 add change log builder action ([65746fd](https://github.com/shufo/blade-formatter/commit/65746fddf7c4739139e629557100339e0306be90))
* 🎸 add coc-blade-formatter to extensions list ([ff6c759](https://github.com/shufo/blade-formatter/commit/ff6c75995e52886497e676ec8261d412ba7335e0))



### [1.10.5](https://github.com/shufo/blade-formatter/compare/v1.10.4...v1.10.5) (2021-03-17)


### Features

* 🎸 bump plugin-php to php 8 supported version (wip) ([2085220](https://github.com/shufo/blade-formatter/commit/2085220dbdb7fb89380a6a8ff929e54a7c4b0973))



### [1.10.4](https://github.com/shufo/blade-formatter/compare/v1.10.3...v1.10.4) (2021-03-14)


### Bug Fixes

* 🐛 echo php expressionn ([ce20576](https://github.com/shufo/blade-formatter/commit/ce205762b0de9488a638e551f209f8771c9c583b))



### [1.10.3](https://github.com/shufo/blade-formatter/compare/v1.10.2...v1.10.3) (2021-03-07)



### [1.10.2](https://github.com/shufo/blade-formatter/compare/v1.10.1...v1.10.2) (2021-02-23)


### Bug Fixes

* 🐛 do not add line return in unescaped blade brace ([#217](https://github.com/shufo/blade-formatter/issues/217)) ([7dd0160](https://github.com/shufo/blade-formatter/commit/7dd0160d8f0c497b2d74e9c029233258c5c7ffd4))



### [1.10.1](https://github.com/shufo/blade-formatter/compare/v1.10.0...v1.10.1) (2021-01-29)


### Bug Fixes

* 🐛 blade brace without space occurs error ([#203](https://github.com/shufo/blade-formatter/issues/203)) ([25c177c](https://github.com/shufo/blade-formatter/commit/25c177c3ad50139152113dddf713f99047292091))
* 🐛 format raw php block within [@php](https://github.com/php) directive ([#201](https://github.com/shufo/blade-formatter/issues/201)) ([d3764b0](https://github.com/shufo/blade-formatter/commit/d3764b0b91f6a19dd945fb9052916dba41ec9bc0))
* 🐛 store blade comment to keep comment body ([#202](https://github.com/shufo/blade-formatter/issues/202)) ([ed19d87](https://github.com/shufo/blade-formatter/commit/ed19d8755bcd1e9e2f0aaca6a5f41d33309bba89))



## [1.10.0](https://github.com/shufo/blade-formatter/compare/v1.9.9...v1.10.0) (2021-01-26)


### Features

* 🎸 add ignore to packages ([ffc85cc](https://github.com/shufo/blade-formatter/commit/ffc85cc41409b26ed607a0c171b69b393a9b796e))
* 🎸 ignore files specified in .bladeignore ([57e76b7](https://github.com/shufo/blade-formatter/commit/57e76b77840986d1f0881c8348eab9f2f6b6e9ad)), closes [#198](https://github.com/shufo/blade-formatter/issues/198) [#9](https://github.com/shufo/blade-formatter/issues/9)



### [1.9.9](https://github.com/shufo/blade-formatter/compare/v1.9.8...v1.9.9) (2021-01-23)


### Bug Fixes

* 🐛 long line with inline directive occurs error ([5c275f0](https://github.com/shufo/blade-formatter/commit/5c275f00f6b415aa4857dd344c6992133f4e566e))



### [1.9.8](https://github.com/shufo/blade-formatter/compare/v1.9.7...v1.9.8) (2021-01-16)


### Bug Fixes

* 🐛 reserve php directive in html tag ([afc1f80](https://github.com/shufo/blade-formatter/commit/afc1f8037732062d606d139a0e341f58744dd742)), closes [#129](https://github.com/shufo/blade-formatter/issues/129)



### [1.9.7](https://github.com/shufo/blade-formatter/compare/v1.9.6...v1.9.7) (2021-01-13)


### Bug Fixes

* 🐛 allow empty curly braces ([7289348](https://github.com/shufo/blade-formatter/commit/72893480c82e7ce6f708b4d7fe3aaea037775694)), closes [#14](https://github.com/shufo/blade-formatter/issues/14)
* 🐛 delete unnecessary escape ([28133be](https://github.com/shufo/blade-formatter/commit/28133be92b4a6228c5eb05e665a6d9111333ce08))



### [1.9.6](https://github.com/shufo/blade-formatter/compare/v1.9.5...v1.9.6) (2020-12-08)


### Bug Fixes

* 🐛 revert oniguruma wasm ([3ed9ab5](https://github.com/shufo/blade-formatter/commit/3ed9ab5be81dc9a991ae5d526560e5440e9a3d9c))
* 🐛 revert vscode-oniguruma to 1.3.1 ([9490a67](https://github.com/shufo/blade-formatter/commit/9490a6707efd09e3d7c9cb33ab7386842ac7a222))



### [1.9.5](https://github.com/shufo/blade-formatter/compare/v1.9.4...v1.9.5) (2020-12-07)


### Features

* 🎸 bump vscode-oniguruma to 1.4.0 ([9e21997](https://github.com/shufo/blade-formatter/commit/9e21997636b0ce75a6f94e979652499c95153f32))



### [1.9.4](https://github.com/shufo/blade-formatter/compare/v1.9.3...v1.9.4) (2020-12-07)


### Bug Fixes

* 🐛 resolve path by require.resolve ([7ef21ed](https://github.com/shufo/blade-formatter/commit/7ef21ed8a098e186a10c9ca00d17ad63690e9c39))



### [1.9.3](https://github.com/shufo/blade-formatter/compare/v1.9.2...v1.9.3) (2020-12-07)


### Bug Fixes

* 🐛 delete unnecessary return code if exists ([f570b40](https://github.com/shufo/blade-formatter/commit/f570b40f9d40ecbac76519412fa2d5f1cf87b613))


### Features

* 🎸 bump @prettier/plugin-php to ^0.16.0 ([a8f8c26](https://github.com/shufo/blade-formatter/commit/a8f8c2653e96e1efc2dd24667a2f0b3cb09336ac))
* 🎸 bump prettier to 2.2.0 ([671d315](https://github.com/shufo/blade-formatter/commit/671d315c660e81c982e70db304e40ca638d799bc))



### [1.9.2](https://github.com/shufo/blade-formatter/compare/v1.9.1...v1.9.2) (2020-12-06)


### Bug Fixes

* 🐛 catch exception for loading wasm ([3d647c7](https://github.com/shufo/blade-formatter/commit/3d647c7f4b7b766908ddaec973acb12f52f5535d))



### [1.9.1](https://github.com/shufo/blade-formatter/compare/v1.9.0...v1.9.1) (2020-11-05)


### Bug Fixes

* 🐛 add newline escape character for escaped tag ([62c3449](https://github.com/shufo/blade-formatter/commit/62c3449c1e90b61d1ef834d74d243fc0f40bba43)), closes [#166](https://github.com/shufo/blade-formatter/issues/166)



## [1.9.0](https://github.com/shufo/blade-formatter/compare/v1.8.1...v1.9.0) (2020-11-03)


### Features

* 🎸 add supported directives ([2f25d44](https://github.com/shufo/blade-formatter/commit/2f25d44481d3552a76b7c8f4c52c07405fa33e68))



### [1.8.1](https://github.com/shufo/blade-formatter/compare/v1.8.0...v1.8.1) (2020-11-03)


### Bug Fixes

* 🐛 do nothing if something goes wrong while formatting ([d46c7e6](https://github.com/shufo/blade-formatter/commit/d46c7e6a28d32d655518158e53f4d96a103255d2)), closes [#128](https://github.com/shufo/blade-formatter/issues/128)



## [1.8.0](https://github.com/shufo/blade-formatter/compare/v1.7.0...v1.8.0) (2020-10-17)



## [1.7.0](https://github.com/shufo/blade-formatter/compare/v1.6.4...v1.7.0) (2020-08-08)


### Bug Fixes

* 🐛 typo command example ([e5498ec](https://github.com/shufo/blade-formatter/commit/e5498ec59ea7f023b1990fe833115a95ed6f0361))


### Features

* 🎸 support stdin input ([#124](https://github.com/shufo/blade-formatter/issues/124)) ([b180522](https://github.com/shufo/blade-formatter/commit/b180522f3f1801e9def2773f11851feaea0f9628)), closes [#123](https://github.com/shufo/blade-formatter/issues/123) [#110](https://github.com/shufo/blade-formatter/issues/110) [#123](https://github.com/shufo/blade-formatter/issues/123)



### [1.6.4](https://github.com/shufo/blade-formatter/compare/v1.6.3...v1.6.4) (2020-08-04)


### Bug Fixes

* 🐛 support case insensitive directive ([fbb3a6d](https://github.com/shufo/blade-formatter/commit/fbb3a6d30e006f83f0da483f8cd4e6087f7cea9f))



### [1.6.3](https://github.com/shufo/blade-formatter/compare/v1.6.2...v1.6.3) (2020-08-02)


### Bug Fixes

* 🐛 add while ~ endwhile for formatting target ([8ef5b33](https://github.com/shufo/blade-formatter/commit/8ef5b333a5157ddb32e761c10221ffcad2d7af37))
* 🐛 add while ~ endwhile to replace pattern ([5cfa7b3](https://github.com/shufo/blade-formatter/commit/5cfa7b3c554ec53077e845b83bd6f9856b5925d5))
* 🐛 pad no whitespaces if calculated whitespaces less than 0 ([552af4a](https://github.com/shufo/blade-formatter/commit/552af4a9526fe4a08537217da53cda9c8ba503c4))



### [1.6.2](https://github.com/shufo/blade-formatter/compare/v1.6.1...v1.6.2) (2020-08-02)


### Bug Fixes

* 🐛 comment in blade directive causes unexpected result ([19c4f6f](https://github.com/shufo/blade-formatter/commit/19c4f6facc9d422e0ede7c8411f46241375d3daf))



### [1.6.1](https://github.com/shufo/blade-formatter/compare/v1.6.0...v1.6.1) (2020-08-02)



## [1.6.0](https://github.com/shufo/blade-formatter/compare/v1.5.4...v1.6.0) (2020-07-30)


### Features

* preserve spaces between php directive and parentheses [#116](https://github.com/shufo/blade-formatter/issues/116) ([e947455](https://github.com/shufo/blade-formatter/commit/e9474558eb2df82e778b2b774ebad52390bbbc25))



### [1.5.4](https://github.com/shufo/blade-formatter/compare/v1.5.3...v1.5.4) (2020-07-28)


### Bug Fixes

* 🐛 ignore forelse directive for formatting ([#115](https://github.com/shufo/blade-formatter/issues/115)) ([10fbb25](https://github.com/shufo/blade-formatter/commit/10fbb254364fff5737ac6e901257bc821b54c529))



### [1.5.3](https://github.com/shufo/blade-formatter/compare/v1.5.2...v1.5.3) (2020-07-28)


### Bug Fixes

* 🐛 regex to match balanced parentheses ([#114](https://github.com/shufo/blade-formatter/issues/114)) ([6ab9a21](https://github.com/shufo/blade-formatter/commit/6ab9a2125f702ca59ec8e943f0a3618490004fd5))



### [1.5.2](https://github.com/shufo/blade-formatter/compare/v1.5.1...v1.5.2) (2020-07-28)


### Bug Fixes

* 🐛 unexpectedly remove tags after blade close expression ([7fb3a17](https://github.com/shufo/blade-formatter/commit/7fb3a17b4c0a2bfe2d0c11bb7f461bc0ead647ba))



### [1.5.1](https://github.com/shufo/blade-formatter/compare/v1.5.0...v1.5.1) (2020-07-27)


### Bug Fixes

* 🐛 do not remove original php tag ([0719a13](https://github.com/shufo/blade-formatter/commit/0719a13a4d25d2268b3c58a116cf5fb561a0d1d1))



## [1.5.0](https://github.com/shufo/blade-formatter/compare/v1.4.0...v1.5.0) (2020-07-26)


### Bug Fixes

* 🐛 comment line corrupted when it is too long ([5f4fa22](https://github.com/shufo/blade-formatter/commit/5f4fa2259051cd9df2b8962fd6bdd28db0c9c0d3))
* 🐛 html close tag near php close tag occurs error ([30fc7c4](https://github.com/shufo/blade-formatter/commit/30fc7c482e263eb78da2e8482725f91152293168))
* 🐛 method call should be inline ([49e2d00](https://github.com/shufo/blade-formatter/commit/49e2d00647c9f75cdb32a37f797c8bf70430c71a)), closes [#2](https://github.com/shufo/blade-formatter/issues/2)
* 🐛 reindex directory for language stats ([cf57e4b](https://github.com/shufo/blade-formatter/commit/cf57e4b350d424e970b3980a52e22aaaba50c47a))
* 🐛 use .gitattributes instead ([e82214d](https://github.com/shufo/blade-formatter/commit/e82214d2355f1f97d5ef4fd5464fc4704fc22529))



## [1.4.0](https://github.com/shufo/blade-formatter/compare/v1.3.1...v1.4.0) (2020-07-23)


### Bug Fixes

* 🐛 consider child methods in foreach directive ([0bbbfdc](https://github.com/shufo/blade-formatter/commit/0bbbfdc7f2aa93496d6d6d8cc08bb29a33505703))


### Features

* 🎸 support [@for](https://github.com/for) directive ([5c6152b](https://github.com/shufo/blade-formatter/commit/5c6152b6606ba63cdaebc3fa798f6c3b8e8db219)), closes [#11](https://github.com/shufo/blade-formatter/issues/11)



### [1.3.1](https://github.com/shufo/blade-formatter/compare/v1.3.0...v1.3.1) (2020-07-20)


### Bug Fixes

* 🐛 should remove semicolon in last line of file ([49f4177](https://github.com/shufo/blade-formatter/commit/49f41775754cb0c506ccf80d8297eff180ee0adb))



## [1.3.0](https://github.com/shufo/blade-formatter/compare/v1.2.2...v1.3.0) (2020-07-19)


### chore

* 🤖 Release 1.3.0 ([227b0cc](https://github.com/shufo/blade-formatter/commit/227b0cc1d59b2435690698c24acfbd5b5633f30e))


### Features

* 🎸 add vscode-textmate ([d935afe](https://github.com/shufo/blade-formatter/commit/d935afe1f3dc6b021203381b0bdea5426cd25fbf))
* 🎸 implement format API ([4e7e4e4](https://github.com/shufo/blade-formatter/commit/4e7e4e4d0533fd4ed61471b53e1fd2f9899bd9a4))
* 🎸 register vscode-textmate instance by passed params ([1564b0b](https://github.com/shufo/blade-formatter/commit/1564b0b4732d9cc6bd1a485720b53ba19e6f65fd))


### BREAKING CHANGES

* 🧨 Changes BladeFormatter constructor argument order. Please format files
via BladeFormatter.format()



### [1.2.2](https://github.com/shufo/blade-formatter/compare/v1.2.1...v1.2.2) (2020-07-19)


### Bug Fixes

* 🐛 ignore blade style commented lines ([ebd8281](https://github.com/shufo/blade-formatter/commit/ebd82810ae6a552d07873ffffabf898af24f0f19)), closes [#8](https://github.com/shufo/blade-formatter/issues/8)



### [1.2.1](https://github.com/shufo/blade-formatter/compare/v1.2.0...v1.2.1) (2020-07-18)


### Bug Fixes

* 🐛 avoid unexpected replacement ([f4f5db1](https://github.com/shufo/blade-formatter/commit/f4f5db1321a59653bf3d36f5a0095c37a61dbe5c))
* 🐛 preserve embedded php tags in original content ([fe8fad9](https://github.com/shufo/blade-formatter/commit/fe8fad9a1d0a34a14af67facf5901ed1bdcaf87f)), closes [#56](https://github.com/shufo/blade-formatter/issues/56) [#57](https://github.com/shufo/blade-formatter/issues/57)
* 🐛 revert unnecessary commit ([5a18712](https://github.com/shufo/blade-formatter/commit/5a18712aad0b48b007cca2d98d9bc1f674397bb7))



## [1.2.0](https://github.com/shufo/blade-formatter/compare/v1.1.3...v1.2.0) (2020-07-18)


### Bug Fixes

* 🐛 allow Release string to put anyware ([98b2992](https://github.com/shufo/blade-formatter/commit/98b2992203ffeaecb90c7254b96565dfa35f4b51))
* 🐛 fix minimum support version to 10.x ([e5974d9](https://github.com/shufo/blade-formatter/commit/e5974d98876f5d9cda5bc34b1a1931205f20dd22))
* 🐛 preserve original if attempting overwrite with nothing ([268b604](https://github.com/shufo/blade-formatter/commit/268b6041b5a2bf98b8b29580c9c433184928a934))
* **formatter:** do not insert padding in blankline ([ab369bd](https://github.com/shufo/blade-formatter/commit/ab369bd2300a7398e0aa68d155bcb74727b715ea)), closes [#48](https://github.com/shufo/blade-formatter/issues/48)
* **formatter:** fix indentation problem on inline directive and html tags are mixed refs [#3](https://github.com/shufo/blade-formatter/issues/3) ([00b85a3](https://github.com/shufo/blade-formatter/commit/00b85a3dffee3e90690477130f34f9c8f31a18ed))


### Features

* 🎸 require node version to >= 0.10 ([7615f8c](https://github.com/shufo/blade-formatter/commit/7615f8c3d3915c1cf492e491e0bbd71db3b4b56c))



### [1.1.3](https://github.com/shufo/blade-formatter/compare/v1.1.2...v1.1.3) (2019-11-09)


### Bug Fixes

* **formatter:** do not clear inline directive ([1359775](https://github.com/shufo/blade-formatter/commit/13597750628e40f3a841e78585a56776ceb94a25)), closes [#3](https://github.com/shufo/blade-formatter/issues/3)



### [1.1.2](https://github.com/shufo/blade-formatter/compare/v1.1.1...v1.1.2) (2019-11-09)



### [1.1.1](https://github.com/shufo/blade-formatter/compare/1.1.0...v1.1.1) (2019-10-27)



## [1.1.0](https://github.com/shufo/blade-formatter/compare/v1.0.2...1.1.0) (2019-10-27)



### [1.0.2](https://github.com/shufo/blade-formatter/compare/v1.0.1...v1.0.2) (2019-10-26)



### 1.0.1 (2019-10-26)
