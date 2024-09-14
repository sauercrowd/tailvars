# varwind

A simple tailwind inspired syntax, letting you directly assign css variables to dom elements through attributes

## Example
```html
<div x-css-vars="p--1 hover:bg--gray-500 pl-[8px] @sm:pr--8 margin-right--4">...</div>
```

Is an equivalent syntax to

```
{
  padding: var(--1);
  padding-left: 8px;
}

:hover {
   background: var(--gray-500);
}

@media (min-width: 360px) {
  padding-right: var(--8);
}
```

(We used a few shorthands here such as `p` - these are aliases that can be configured, we could have used any css property directly as well like `margin-right--8`)

### Advantages
- no build step
- browser native css variables (devtools can auto-complete the right property values and preview colors)
- predictable syntax
- extensible through regular additional stylesheets
- naturally scoped (css variables can be specific for the root but overwritten with more specific definitions)
- easily convertible to user-defined component classes when needed (predictable syntax)
- tokens (e.g. `ml-8`) dont have to treated as atoms but can be concatenated in react/backend/... (e.g. `"ml-" + marginLeftNumber`), since only evaluated once rendered on the client

### Disadvantages
- requires Javascript to generate styles/classes on the client
- 1:1 mapping - tailwind in some cases defines a utility class with multiple properties

## Setup
```html
<html>
  <head>
    <!-- you can also define your own variables inline, use other stylesheets defining css variables or combine multiple options -->
    <link rel="stylesheet" href="./tailwindstyles.css">
    <style>
      :root {
        --my-color: #efefef;
      }
    </style>
    <script src="./tailvars.js"></script>
  </head>
  <body>
    <div x-css-vars="p--1 hover:bg--gray-500 pl-[8px] @sm:pr--8 bg--my-color">...</div>
  </body>
</html>
```

### Configuration

#### Properties
Are defined on the object `window.VARWIND_DEFAULT_PROPERTY_ALIASES` and can be extended through `window.VARWIND_EXTRA_PROPERTY_ALIASES`.
If no alias is found, the literal value will be used (so any css property is availabe with the default config).
They can map to either a string or an array. If it's an array, all properties will be set to the value used.

To disable the preset prefixes simply override the default configuration

Current defaults
```
window.VARWIND_DEFAULT_PROPERTY_ALIASES = {
    'p': 'padding',
    'pl': 'padding-left',
    'pr': 'padding-right',
    'pt': 'padding-top',
    'pb': 'padding-bottom',
    'px':['padding-left', 'padding-right'],
    'py': ['padding-top', 'padding-bottom'],
    'm': 'margin',
    'ml': 'margin-left',
    'mr': 'margin-right',
    'mt': 'margin-top',
    'mb': 'margin-bottom',
    'mx': ['margin-left', 'margin-right'],
    'my': ['margin-top', 'margin-bottom'],
    'd': 'display',
    'bg': 'background',
}
```

#### Media Queries

Are defined on the object `window.VARWIND_DEFAULT_MEDIA_QUERIES` and can be extended through `window.VARWIND_EXTRA_MEDIA_QUERIES`.
To disable the preset media queries simply override the default configuration.

Current defaults:
```
window.VARWIND_DEFAULT_MEDIA_QUERIES = {
    'sm': '(min-width: 640px)',
    'md': '(min-width: 768px)',
    'lg': '(min-width: 1024px)',
    'xl': '(min-width: 1280px)',
}
```


#### Prefixes

Are defined on the object `window.VARWIND_DEFAULT_PREFIX_ALIASES` and can be extended through `window.VARWIND_EXTRA_PREFIX_ALIASES`.
To disable the preset prefixes simply override the default configuration. Any element that doesnt match will be treated as a pseudo class (`hover` -> `:hover`).

Current defaults
```
window.VARWIND_DEFAULT_PREFIX_ALIASES= {
    'after': '::after',
    'before': '::before',
    'odd': ':nth-child(odd)',
    'even': ':nth-child(even)',
}
```
