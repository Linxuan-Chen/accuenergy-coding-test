/*
 * @Author: Linxuan Chen
 * @Date: 2020-11-27 20:16:02
 * @LastEditTime: 2020-11-28 23:45:45
 * @Description: Representation component to display map related data
 */

import React from "react";
import style from "./Map.module.scss";

export default function Map(props) {
  return (
    <div className={style.map_wrapper}>
      <div className="clear-float">
        <div className={style.input_group}>{props.children}</div>
      </div>
      <div id="map" style={props.mapStyle}></div>
    </div>
  );
}
