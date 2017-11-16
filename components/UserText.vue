<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: ['text'],
  render (createElement) {
    return createElement(
      'h1',
      'test'
    )
  }
}
</script>
