---
"astro-awesomeness": major
---

Align the React Button with shadcn Base Nova and move theme behavior into compositions. Keep Button, buttonVariants, and ThemeToggle exports unchanged. Button sizing, destructive and secondary treatments, and data attributes now follow the upstream contract; consumers relying on the previous appearance should use product compositions. Static Astro consumers retain their layouts, optional React peer, and brand overrides.
