# 外在 OuterStyle 官网静态站点

公开访问站点：**https://dpenglish-com.github.io/outerstyle-site/**

- 纯静态产物，**源码就在本仓库**，没有构建步骤：改完直接提交即可
- `downloads/` 放 Android 包；`assets/shots/` 是模拟器实拍的界面截图
- 站点用 App 自己的品牌色（深藏青 `#0F172A` + 橙 `#F97316`），
  与母站的中性纸墨语言不同 —— 姊妹站本来就各用各的视觉语言

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | 唯一页面 |
| `styles.css` | 样式，token 驱动的明暗两套 |
| `main.js` | 滚动进度、导航滑块、入场动效、页脚年份 |
| `favicon.svg` | 深藏青底 + 橙色衣架。与 App 的「着装」主题同一意象 |
| `_headers` | APK 的 MIME 与缓存规则（GitHub Pages 忽略，Cloudflare/Netlify 读）|
| `.nojekyll` | 关掉 Jekyll 处理，避免带下划线的 `_headers` 被吞掉 |
| `robots.txt` / `sitemap.xml` | 单页站点，只声明根地址 |

## 更新方式

换包：把新的 APK 放进 `downloads/`，同步改 `index.html` 里三处 ——
下载按钮的 `href`、规格表里的版本 / 体积、以及 SHA-256。

```bash
shasum -a 256 downloads/<新包>.apk      # 把结果填进规格表
git add -A && git commit -m "换包：<版本>" && git push
```

截图：见 `assets/shots/` 里的四张，取自模拟器（Android 34，1080×2340）。
文案必须与截图里看到的界面一致，不要写没截到的功能。

## 部署

GitHub Pages，手动配置（Settings → Pages → main / root），**没有 workflow**。
与 wenbian-site / workoutloop-site / paperecho-site 三站同一套。
