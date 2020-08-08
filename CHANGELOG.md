# [1.7.0](https://github.com/shufo/blade-formatter/compare/v1.6.4...v1.7.0) (2020-08-08)


### Bug Fixes

* 🐛 typo command example ([e5498ec](https://github.com/shufo/blade-formatter/commit/e5498ec59ea7f023b1990fe833115a95ed6f0361))


### Features

* 🎸 support stdin input ([#124](https://github.com/shufo/blade-formatter/issues/124)) ([b180522](https://github.com/shufo/blade-formatter/commit/b180522f3f1801e9def2773f11851feaea0f9628)), closes [#123](https://github.com/shufo/blade-formatter/issues/123) [#110](https://github.com/shufo/blade-formatter/issues/110) [#123](https://github.com/shufo/blade-formatter/issues/123)



## [1.6.4](https://github.com/shufo/blade-formatter/compare/v1.6.3...v1.6.4) (2020-08-04)


### Bug Fixes

* 🐛 support case insensitive directive ([fbb3a6d](https://github.com/shufo/blade-formatter/commit/fbb3a6d30e006f83f0da483f8cd4e6087f7cea9f))



## [1.6.3](https://github.com/shufo/blade-formatter/compare/v1.6.2...v1.6.3) (2020-08-02)


### Bug Fixes

* 🐛 add while ~ endwhile for formatting target ([8ef5b33](https://github.com/shufo/blade-formatter/commit/8ef5b333a5157ddb32e761c10221ffcad2d7af37))
* 🐛 add while ~ endwhile to replace pattern ([5cfa7b3](https://github.com/shufo/blade-formatter/commit/5cfa7b3c554ec53077e845b83bd6f9856b5925d5))
* 🐛 pad no whitespaces if calculated whitespaces less than 0 ([552af4a](https://github.com/shufo/blade-formatter/commit/552af4a9526fe4a08537217da53cda9c8ba503c4))



## [1.6.2](https://github.com/shufo/blade-formatter/compare/v1.6.1...v1.6.2) (2020-08-02)


### Bug Fixes

* 🐛 comment in blade directive causes unexpected result ([19c4f6f](https://github.com/shufo/blade-formatter/commit/19c4f6facc9d422e0ede7c8411f46241375d3daf))



## [1.6.1](https://github.com/shufo/blade-formatter/compare/v1.6.0...v1.6.1) (2020-08-02)



# [1.6.0](https://github.com/shufo/blade-formatter/compare/v1.5.4...v1.6.0) (2020-07-30)


### Features

* preserve spaces between php directive and parentheses [#116](https://github.com/shufo/blade-formatter/issues/116) ([e947455](https://github.com/shufo/blade-formatter/commit/e9474558eb2df82e778b2b774ebad52390bbbc25))



## [1.5.4](https://github.com/shufo/blade-formatter/compare/v1.5.3...v1.5.4) (2020-07-28)


### Bug Fixes

* 🐛 ignore forelse directive for formatting ([#115](https://github.com/shufo/blade-formatter/issues/115)) ([10fbb25](https://github.com/shufo/blade-formatter/commit/10fbb254364fff5737ac6e901257bc821b54c529))



## [1.5.3](https://github.com/shufo/blade-formatter/compare/v1.5.2...v1.5.3) (2020-07-28)


### Bug Fixes

* 🐛 regex to match balanced parentheses ([#114](https://github.com/shufo/blade-formatter/issues/114)) ([6ab9a21](https://github.com/shufo/blade-formatter/commit/6ab9a2125f702ca59ec8e943f0a3618490004fd5))



## [1.5.2](https://github.com/shufo/blade-formatter/compare/v1.5.1...v1.5.2) (2020-07-28)


### Bug Fixes

* 🐛 unexpectedly remove tags after blade close expression ([7fb3a17](https://github.com/shufo/blade-formatter/commit/7fb3a17b4c0a2bfe2d0c11bb7f461bc0ead647ba))



## [1.5.1](https://github.com/shufo/blade-formatter/compare/v1.5.0...v1.5.1) (2020-07-27)


### Bug Fixes

* 🐛 do not remove original php tag ([0719a13](https://github.com/shufo/blade-formatter/commit/0719a13a4d25d2268b3c58a116cf5fb561a0d1d1))



# [1.5.0](https://github.com/shufo/blade-formatter/compare/v1.4.0...v1.5.0) (2020-07-26)


### Bug Fixes

* 🐛 comment line corrupted when it is too long ([5f4fa22](https://github.com/shufo/blade-formatter/commit/5f4fa2259051cd9df2b8962fd6bdd28db0c9c0d3))
* 🐛 html close tag near php close tag occurs error ([30fc7c4](https://github.com/shufo/blade-formatter/commit/30fc7c482e263eb78da2e8482725f91152293168))
* 🐛 method call should be inline ([49e2d00](https://github.com/shufo/blade-formatter/commit/49e2d00647c9f75cdb32a37f797c8bf70430c71a)), closes [#2](https://github.com/shufo/blade-formatter/issues/2)
* 🐛 reindex directory for language stats ([cf57e4b](https://github.com/shufo/blade-formatter/commit/cf57e4b350d424e970b3980a52e22aaaba50c47a))
* 🐛 use .gitattributes instead ([e82214d](https://github.com/shufo/blade-formatter/commit/e82214d2355f1f97d5ef4fd5464fc4704fc22529))



# [1.4.0](https://github.com/shufo/blade-formatter/compare/v1.3.1...v1.4.0) (2020-07-23)


### Bug Fixes

* 🐛 consider child methods in foreach directive ([0bbbfdc](https://github.com/shufo/blade-formatter/commit/0bbbfdc7f2aa93496d6d6d8cc08bb29a33505703))


### Features

* 🎸 support [@for](https://github.com/for) directive ([5c6152b](https://github.com/shufo/blade-formatter/commit/5c6152b6606ba63cdaebc3fa798f6c3b8e8db219)), closes [#11](https://github.com/shufo/blade-formatter/issues/11)



## [1.3.1](https://github.com/shufo/blade-formatter/compare/v1.3.0...v1.3.1) (2020-07-20)


### Bug Fixes

* 🐛 should remove semicolon in last line of file ([49f4177](https://github.com/shufo/blade-formatter/commit/49f41775754cb0c506ccf80d8297eff180ee0adb))



# [1.3.0](https://github.com/shufo/blade-formatter/compare/v1.2.2...v1.3.0) (2020-07-19)


### chore

* 🤖 Release 1.3.0 ([227b0cc](https://github.com/shufo/blade-formatter/commit/227b0cc1d59b2435690698c24acfbd5b5633f30e))


### Features

* 🎸 add vscode-textmate ([d935afe](https://github.com/shufo/blade-formatter/commit/d935afe1f3dc6b021203381b0bdea5426cd25fbf))
* 🎸 implement format API ([4e7e4e4](https://github.com/shufo/blade-formatter/commit/4e7e4e4d0533fd4ed61471b53e1fd2f9899bd9a4))
* 🎸 register vscode-textmate instance by passed params ([1564b0b](https://github.com/shufo/blade-formatter/commit/1564b0b4732d9cc6bd1a485720b53ba19e6f65fd))


### BREAKING CHANGES

* 🧨 Changes BladeFormatter constructor argument order. Please format files
via BladeFormatter.format()



## [1.2.2](https://github.com/shufo/blade-formatter/compare/v1.2.1...v1.2.2) (2020-07-19)


### Bug Fixes

* 🐛 ignore blade style commented lines ([ebd8281](https://github.com/shufo/blade-formatter/commit/ebd82810ae6a552d07873ffffabf898af24f0f19)), closes [#8](https://github.com/shufo/blade-formatter/issues/8)



## [1.2.1](https://github.com/shufo/blade-formatter/compare/v1.2.0...v1.2.1) (2020-07-18)


### Bug Fixes

* 🐛 avoid unexpected replacement ([f4f5db1](https://github.com/shufo/blade-formatter/commit/f4f5db1321a59653bf3d36f5a0095c37a61dbe5c))
* 🐛 preserve embedded php tags in original content ([fe8fad9](https://github.com/shufo/blade-formatter/commit/fe8fad9a1d0a34a14af67facf5901ed1bdcaf87f)), closes [#56](https://github.com/shufo/blade-formatter/issues/56) [#57](https://github.com/shufo/blade-formatter/issues/57)
* 🐛 revert unnecessary commit ([5a18712](https://github.com/shufo/blade-formatter/commit/5a18712aad0b48b007cca2d98d9bc1f674397bb7))



# [1.2.0](https://github.com/shufo/blade-formatter/compare/v1.1.3...v1.2.0) (2020-07-18)


### Bug Fixes

* **formatter:** do not insert padding in blankline ([ab369bd](https://github.com/shufo/blade-formatter/commit/ab369bd2300a7398e0aa68d155bcb74727b715ea)), closes [#48](https://github.com/shufo/blade-formatter/issues/48)
* **formatter:** fix indentation problem on inline directive and html tags are mixed refs [#3](https://github.com/shufo/blade-formatter/issues/3) ([00b85a3](https://github.com/shufo/blade-formatter/commit/00b85a3dffee3e90690477130f34f9c8f31a18ed))
* 🐛 allow Release string to put anyware ([98b2992](https://github.com/shufo/blade-formatter/commit/98b2992203ffeaecb90c7254b96565dfa35f4b51))
* 🐛 fix minimum support version to 10.x ([e5974d9](https://github.com/shufo/blade-formatter/commit/e5974d98876f5d9cda5bc34b1a1931205f20dd22))
* 🐛 preserve original if attempting overwrite with nothing ([268b604](https://github.com/shufo/blade-formatter/commit/268b6041b5a2bf98b8b29580c9c433184928a934))


### Features

* 🎸 require node version to >= 0.10 ([7615f8c](https://github.com/shufo/blade-formatter/commit/7615f8c3d3915c1cf492e491e0bbd71db3b4b56c))



## [1.1.3](https://github.com/shufo/blade-formatter/compare/v1.1.2...v1.1.3) (2019-11-09)


### Bug Fixes

* **formatter:** do not clear inline directive ([1359775](https://github.com/shufo/blade-formatter/commit/13597750628e40f3a841e78585a56776ceb94a25)), closes [#3](https://github.com/shufo/blade-formatter/issues/3)



## [1.1.2](https://github.com/shufo/blade-formatter/compare/v1.1.1...v1.1.2) (2019-11-09)



## [1.1.1](https://github.com/shufo/blade-formatter/compare/1.1.0...v1.1.1) (2019-10-27)



# [1.1.0](https://github.com/shufo/blade-formatter/compare/v1.0.2...1.1.0) (2019-10-27)



## [1.0.2](https://github.com/shufo/blade-formatter/compare/v1.0.1...v1.0.2) (2019-10-26)



## 1.0.1 (2019-10-26)



