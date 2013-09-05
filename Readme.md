# Anore

Models.

### Why not backbone?

Nesting models in models and observation of Primitives.

## Primitives?

Backbone only allows you to manage properties of objects. 

Primitives represent a single primitive value.

```js
var str = new Anore.Primitive("hi, friend")
str.on("change", function() { console.log('change') })
str.set("HA HA")
```

I tried to use backbone's stuff to do that, but it was really difficult and I had to do up wrapper models for primitive values anyway.
