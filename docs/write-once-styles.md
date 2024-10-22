## Write and style once, render anywhere

The default UI primitives to use for building Universal Apps are those that react-native comes with. Instead of using `<div>`, `<p>`, `<span>` or `<img>`, you instead use `<View>`, `<Text>` and `<Image>`

```typescript
import { View, Text, Image } from 'react-native'
// ☝️ Auto-transformed to 'react-native-web' in Next.js
```

However, you'll likely want to introduce tailwind-style `className` support through [Nativewind](https://www.nativewind.dev/):

```typescript
import { View, Text, Image } from 'nativewind'
// ☝️ Import from 'nativewind' instead
```

```typescript
<View className="px-2 max-w-[100px] items-center rounded-md">

/* Use the 'className' prop like you would with tailwind on the web */

// ⬇⬇⬇

// When rendering on iOS and Android:

//  'px-2'          -> { paddingLeft: 8, paddingRight: 8 }
//  'max-w-[100px]' -> { maxWidth: 100 }
//  'items-center'  -> { alignItems: 'center' }
//  'rounded-md'    -> { borderRadius: 6 }

// -- vs. --

// When rendering on the server or browser:

//  'px-2'          -> padding-left: 8px; padding-right: 8px;
//  'max-w-[100px]' -> max-width: 100px;
//  'items-center'  -> align-items: center;
//  'rounded-md'    -> border-radius: 6px;

// (uses regular tailwind css stylesheet on web to apply as actual CSS)
```

### Responsive Design

If you're doing SSR with responsive-design, this becomes real handy to apply media-queries:

```typescript
<Text className"text-base lg:text-lg">

// Will apply the classes from a mobile-first perspective:

// ⬇⬇⬇

// on screens smaller than the 'lg' breakpoint:

//  'text-base'     -> font-size: 16px;

// -- vs. --

// on screens larger than the 'lg' breakpoint:

//  'lg:text-lg'    -> @media (min-width: 1024px) {
//                        .lg\:text-lg {
//                          font-size: 18px;
//                        }
//                     }
```

> Check [nativewind.dev](https://nativewind.dev) and [tailwindcss.com](https://tailwindcss.com/) for a deeper understanding of [Universal Styling](TODO) and breakpoints

### Optimized Images

Some primitives like the `Image` component have optimized versions for each environment:

- `next/image` for web
- `expo-image` for native

To automatically use the right in the context that it's rendered, we've provided our own universal `Image` component:

```typescript
import { Image } from '@green-stack/components/Image'
```

Which, ofcourse, you might wish to wrap with Nativewind to provide class names to:

`styled.tsx`

```typescript
import { Image as UniversalImage } from '@green-stack/components/Image'
// ☝️ Import the universal Image component
import { styled } from 'nativewind'

// ⬇⬇⬇

export const Image = styled(UniversalImage, '')
// ☝️ Adds the ability to assign tailwind classes
```

You could also create other fixed styles for e.g. headings using this same method:

`styled.tsx`

```typescript
import { Text as RNText } from 'react-native'
import { styled } from 'nativewind'

// ... other re-exported predefined styles ...

/* --- Typography ------------ */

export const P = styled(RNText, 'text-base')
export const H1 = styled(RNText, 'font-bold text-2xl text-primary-100')
export const H2 = styled(RNText, 'font-bold text-xl text-primary-100')
export const H3 = styled(RNText, 'font-bold text-lg text-primary-100')
// ☝️ These styles will always be applied unless overridden by the className prop

```

Usage:

```typescript
import { Image, View, H1, P } from '@app/primitives'

// ⬇⬇⬇

<View className="w-full lg:max-w-[600px]">

    <Image className="rounded-md 2xl:" src="..." />

    <H1 className="text-primary-300">
    {/* ☝️ overrides color from predefined, but keeps the other classes */}

</View>
```

# -!- TBC
