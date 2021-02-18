const { tarsiers_ph } = require('./stickerGroup/tarsiers_ph')
const { orangutan_my_new } = require('./stickerGroup/orangutan_my_new')
const { shrimp_sg_new } = require('./stickerGroup/shrimp_sg_new')
const { shogi_th } = require('./stickerGroup/shogi_th')
const { shogi2 } = require('./stickerGroup/shogi2')
const { shogi3 } = require('./stickerGroup/shogi3')
const { shrimp_tw } = require('./stickerGroup/shrimp_tw')
const { shrimp_id_new } = require('./stickerGroup/shrimp_id_new')
const { orangutan_vn_new } = require('./stickerGroup/orangutan_vn_new')
const { shrimp_vn_new } = require('./stickerGroup/shrimp_vn_new')
const { sticker_vn_choki } = require('./stickerGroup/sticker_vn_choki')
const { sticker_vn_ronaldo } = require('./stickerGroup/sticker_vn_ronaldo')
const { tarsiers_vn } = require('./stickerGroup/tarsiers_vn')
const { xiaxiaobian_vn } = require('./stickerGroup/xiaxiaobian_vn')
const { shogi1_vn } = require('./stickerGroup/shogi1_vn')
const { shogi2_vn } = require('./stickerGroup/shogi2_vn')
const { shogi3_vn } = require('./stickerGroup/shogi3_vn')
const { shogi4_vn } = require('./stickerGroup/shogi4_vn')
const sticker_map = {
  'my': orangutan_my_new,
  'ph': tarsiers_ph,
  'sg': shrimp_sg_new,
  'th': {
    site_code: 'th',
    imgArr: shogi_th.imgArr.concat(shogi2.imgArr, shogi3.imgArr)
  },
  'tw': shrimp_tw,
  'id': shrimp_id_new,
  'br': shrimp_sg_new,
  'vn': {
    site_code: 'vn',
    imgArr: shrimp_vn_new.imgArr.concat(orangutan_vn_new.imgArr,sticker_vn_ronaldo.imgArr,shogi1_vn.imgArr,shogi2_vn.imgArr,shogi3_vn.imgArr,shogi4_vn.imgArr,xiaxiaobian_vn.imgArr,sticker_vn_choki.imgArr,tarsiers_vn.imgArr)
  }
}
export {
  sticker_map
}
