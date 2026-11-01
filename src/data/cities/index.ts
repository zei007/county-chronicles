/** 自动生成: node scripts/gen-index.mjs — 请勿手工编辑 */
import type { CityData } from "@/lib/types";

import city_baiyin from "./baiyin.json";
import city_baotou from "./baotou.json";
import city_changjiang from "./changjiang.json";
import city_daqing from "./daqing.json";
import city_datong from "./datong.json";
import city_daye from "./daye.json";
import city_dexing from "./dexing.json";
import city_dongchuan from "./dongchuan.json";
import city_fushun from "./fushun.json";
import city_fuxin from "./fuxin.json";
import city_geermu from "./geermu.json";
import city_gejiu from "./gejiu.json";
import city_hebi from "./hebi.json";
import city_hegang from "./hegang.json";
import city_huaibei from "./huaibei.json";
import city_huainan from "./huainan.json";
import city_huludao from "./huludao.json";
import city_jiaozuo from "./jiaozuo.json";
import city_jinchang from "./jinchang.json";
import city_kelamayi from "./kelamayi.json";
import city_lengshuijiang from "./lengshuijiang.json";
import city_lianyuan from "./lianyuan.json";
import city_liaoyuan from "./liaoyuan.json";
import city_lingbao from "./lingbao.json";
import city_mozhugongka from "./mozhugongka.json";
import city_panzhihua from "./panzhihua.json";
import city_pingguo from "./pingguo.json";
import city_pingxiang from "./pingxiang.json";
import city_qitaihe from "./qitaihe.json";
import city_shanghang from "./shanghang.json";
import city_shizuishan from "./shizuishan.json";
import city_shuangyashan from "./shuangyashan.json";
import city_suichang from "./suichang.json";
import city_tangshan from "./tangshan.json";
import city_tongling from "./tongling.json";
import city_wanshan from "./wanshan.json";
import city_wansheng from "./wansheng.json";
import city_xinyu from "./xinyu.json";
import city_xuzhou from "./xuzhou.json";
import city_yangquan from "./yangquan.json";
import city_yulin from "./yulin.json";
import city_yumen from "./yumen.json";
import city_yunfu from "./yunfu.json";
import city_zhaoyuan from "./zhaoyuan.json";
import sez_chongqing from "./sez/chongqing.json";
import sez_hainan from "./sez/hainan.json";
import sez_hainanfp from "./sez/hainanfp.json";
import sez_huoerguosi from "./sez/huoerguosi.json";
import sez_kashi from "./sez/kashi.json";
import sez_shanghai from "./sez/shanghai.json";
import sez_shantou from "./sez/shantou.json";
import sez_shenzhen from "./sez/shenzhen.json";
import sez_tianjin from "./sez/tianjin.json";
import sez_xiamen from "./sez/xiamen.json";
import sez_zhuhai from "./sez/zhuhai.json";

export const CITY_MAP: Record<string, CityData> = {};
export const CITY_LIST: { key: string; data: CityData }[] = [
  { key: "baiyin", data: city_baiyin as unknown as CityData },
  { key: "baotou", data: city_baotou as unknown as CityData },
  { key: "changjiang", data: city_changjiang as unknown as CityData },
  { key: "daqing", data: city_daqing as unknown as CityData },
  { key: "datong", data: city_datong as unknown as CityData },
  { key: "daye", data: city_daye as unknown as CityData },
  { key: "dexing", data: city_dexing as unknown as CityData },
  { key: "dongchuan", data: city_dongchuan as unknown as CityData },
  { key: "fushun", data: city_fushun as unknown as CityData },
  { key: "fuxin", data: city_fuxin as unknown as CityData },
  { key: "geermu", data: city_geermu as unknown as CityData },
  { key: "gejiu", data: city_gejiu as unknown as CityData },
  { key: "hebi", data: city_hebi as unknown as CityData },
  { key: "hegang", data: city_hegang as unknown as CityData },
  { key: "huaibei", data: city_huaibei as unknown as CityData },
  { key: "huainan", data: city_huainan as unknown as CityData },
  { key: "huludao", data: city_huludao as unknown as CityData },
  { key: "jiaozuo", data: city_jiaozuo as unknown as CityData },
  { key: "jinchang", data: city_jinchang as unknown as CityData },
  { key: "kelamayi", data: city_kelamayi as unknown as CityData },
  { key: "lengshuijiang", data: city_lengshuijiang as unknown as CityData },
  { key: "lianyuan", data: city_lianyuan as unknown as CityData },
  { key: "liaoyuan", data: city_liaoyuan as unknown as CityData },
  { key: "lingbao", data: city_lingbao as unknown as CityData },
  { key: "mozhugongka", data: city_mozhugongka as unknown as CityData },
  { key: "panzhihua", data: city_panzhihua as unknown as CityData },
  { key: "pingguo", data: city_pingguo as unknown as CityData },
  { key: "pingxiang", data: city_pingxiang as unknown as CityData },
  { key: "qitaihe", data: city_qitaihe as unknown as CityData },
  { key: "shanghang", data: city_shanghang as unknown as CityData },
  { key: "shizuishan", data: city_shizuishan as unknown as CityData },
  { key: "shuangyashan", data: city_shuangyashan as unknown as CityData },
  { key: "suichang", data: city_suichang as unknown as CityData },
  { key: "tangshan", data: city_tangshan as unknown as CityData },
  { key: "tongling", data: city_tongling as unknown as CityData },
  { key: "wanshan", data: city_wanshan as unknown as CityData },
  { key: "wansheng", data: city_wansheng as unknown as CityData },
  { key: "xinyu", data: city_xinyu as unknown as CityData },
  { key: "xuzhou", data: city_xuzhou as unknown as CityData },
  { key: "yangquan", data: city_yangquan as unknown as CityData },
  { key: "yulin", data: city_yulin as unknown as CityData },
  { key: "yumen", data: city_yumen as unknown as CityData },
  { key: "yunfu", data: city_yunfu as unknown as CityData },
  { key: "zhaoyuan", data: city_zhaoyuan as unknown as CityData },
];

/** 对照组城市（经济特区/开放高地，用于「兴」的参照） */
export const SEZ_LIST: { key: string; data: CityData }[] = [
  { key: "chongqing", data: sez_chongqing as unknown as CityData },
  { key: "hainan", data: sez_hainan as unknown as CityData },
  { key: "hainanfp", data: sez_hainanfp as unknown as CityData },
  { key: "huoerguosi", data: sez_huoerguosi as unknown as CityData },
  { key: "kashi", data: sez_kashi as unknown as CityData },
  { key: "shanghai", data: sez_shanghai as unknown as CityData },
  { key: "shantou", data: sez_shantou as unknown as CityData },
  { key: "shenzhen", data: sez_shenzhen as unknown as CityData },
  { key: "tianjin", data: sez_tianjin as unknown as CityData },
  { key: "xiamen", data: sez_xiamen as unknown as CityData },
  { key: "zhuhai", data: sez_zhuhai as unknown as CityData },
];

for (const it of CITY_LIST) CITY_MAP[it.key] = it.data;
for (const it of SEZ_LIST) CITY_MAP[it.key] = it.data;

export function getCity(key: string): CityData | undefined {
  return CITY_MAP[key];
}
