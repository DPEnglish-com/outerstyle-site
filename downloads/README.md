# 下载包

这里放站上下发的 Android 安装包。文件名固定包含版本号，换包时同步改
`index.html` 里的三处（href、版本/体积、SHA-256）。

## 当前

| 项 | 值 |
|---|---|
| 文件 | `OuterStyle-0.2.0-debug.apk` |
| 版本 | 0.2.0（versionCode 2）|
| 构建类型 | debug（内测）|
| 体积 | 19.1 MB |
| 系统要求 | Android 8.0 及以上（minSdk 26）|
| SHA-256 | `988c45ab0b129801a7b023040888ea252abb55236fb9e517722cb23854e0fca5` |

## 发布清单

- [ ] 新包拷进本目录
- [ ] `shasum -a 256 <包名>` 更新到站点规格表与上表
- [ ] 站点上写明构建类型：debug 包会如实标注「内测调试构建」
- [ ] 提交：`git add -A && git commit -m "换包：v0.2.x"`
