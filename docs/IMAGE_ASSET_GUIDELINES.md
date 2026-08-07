# Image asset guidelines

This document defines the repository budget and delivery rules for website images. It is project documentation and is not rendered as website content.

## Storage

- Put images referenced from Markdown notes under `public/images/notes/<note-slug>/`.
- Reference those files with root-relative URLs such as `/images/notes/example/diagram.webp`.
- Put images imported by JavaScript or CSS under `src/assets/` so Vite can fingerprint them.
- Do not hotlink article images from third-party hosts.
- Do not commit full-resolution generation sources when an optimized derivative is sufficient for the site.

Files in `public/` keep their original names. When replacing an image with materially different pixels, change its filename so existing browser and CDN caches cannot serve the old version.

## Formats

- Use WebP by default for raster illustrations and photographs.
- Use SVG for small deterministic diagrams, icons, and logos when vector source is appropriate.
- Use PNG only when lossless pixels or alpha quality is required and WebP is unsuitable.
- Do not use animated GIF. Prefer CSS animation or a compressed video when motion is necessary.

## Dimensions and file budgets

The shared article column is at most 780 CSS pixels wide. A 1400–1560 pixel source covers common high-density displays without keeping unnecessary resolution.

| Asset | Recommended dimensions | Target size | Maximum without an explicit exception |
| --- | --- | ---: | ---: |
| Inline article illustration | 1400–1560 px wide, usually 3:2 or 16:9 | 100–180 KiB | 250 KiB |
| Article image total | Two or three images | 300–500 KiB | 600 KiB per article |
| Hero or large section image | Up to 1920 px wide | 200–300 KiB | 400 KiB |
| Icon or small decorative image | Render size at 2× density | Under 25 KiB | 50 KiB |

Keep every committed image below 1 MiB. This is much smaller than GitHub's hard per-file limit, but it follows GitHub's repository-health recommendation for individual objects and keeps clones practical.

## Rendering and accessibility

- Images must fit the article column with `max-width: 100%` and `height: auto`.
- Non-critical article images should use `loading="lazy"` and `decoding="async"`.
- Write concise alt text that communicates the image's purpose. Use an empty alt only for genuinely decorative images.
- Do not put essential labels or explanations only inside generated artwork.
- Check the result at desktop and mobile widths before merging.

## GitHub Pages constraints

GitHub currently documents these relevant limits:

- The published Pages site must be no larger than 1 GB.
- The Pages source repository has a recommended limit of 1 GB.
- Pages has a soft bandwidth limit of 100 GB per month.
- Regular Git repositories reject individual files larger than 100 MiB and warn for files larger than 50 MiB.
- Git LFS cannot be used to serve GitHub Pages assets.

The repository budgets above are performance targets, not a restatement of those hosting limits.

Official references:

- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
- [Repository limits](https://docs.github.com/en/repositories/creating-and-managing-repositories/repository-limits)
- [About large files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- [About Git Large File Storage](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-git-large-file-storage)

## Review checklist

- The image is stored in the correct directory.
- The format matches the asset type.
- Pixel dimensions and encoded size stay within the table above.
- Alt text is present and useful.
- The image remains sharp without overflowing on mobile.
- The production build contains the optimized derivative, not the generation source.
