<template>
  <ul class="sticker-box is-set-scroll">
    <li
      v-for="(item, index) in stickerObj.imgArr"
      @click="sendSticker(item)"
      :key="index"
    >
      <img
        :src="item.url"
        alt=""
      >
    </li>
  </ul>
</template>

<script>
  export default {
    name: 'Sticker',

    data() {
      return {
      }
    },
    props: {
      stickerObj: {
        type: Object,
        default: () => {}
      }
    },
    methods: {
      sendSticker(item) {
        const obj = {
          sticker_id: item.id,
          sticker_package_id: item.sticker_package_id
        }
        this.$emit('send-sticker', obj, 'sticker')
      }
    }
  }
</script>

<style lang="scss" scoped>
  .sticker-box {
    margin: 0;
    padding: 5px 20px;
    overflow: hidden;
    height: 180px;
    overflow-y: auto;
    li {
      list-style: none;
      float: left;
      height: 80px;
      width: 90px;
      background: #fff;
      transition: all .3s ease;
      text-align: center;
      padding-top: 10px;
      cursor: pointer;
      img {
        height: 60px;
      }
      &:hover {
        background: #ccc;
      }
    }
  }
</style>
