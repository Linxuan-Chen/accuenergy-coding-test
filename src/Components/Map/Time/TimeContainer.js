/*
 * @Author: Linxuan Chen
 * @Date: 2020-11-28 18:20:17
 * @LastEditTime: 2020-11-28 23:48:18
 * @Description: Container component to fetch time zone data from google time zone APIs
 */
import React, { PureComponent } from "react";
import Time from "./Time";
import { initialLocation } from "../../../Utils/Constants";

//Containers for timers
let timerUTC, timerLocalTime;

export default class TimeContainer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      utcTimeStamp: Math.round(new Date() / 1000),
      selectedLocation: initialLocation,
      previousSelectedLocation: initialLocation,
      selectedLocationTime: null,
      selectedLocationTimeZoneName: "",
    };
    /**
     * @description: Fetch time zone data from google time zone APIs according to coordinates designated to a specified location,
     * store data to local state, calcuate local time of selected location and store them to local state.
     */
    this.getTimeZone = () => {
      fetch(
        `https://maps.googleapis.com/maps/api/timezone/json?location=${this.state.selectedLocation.lat
        },${this.state.selectedLocation.lng}&timestamp=${this.state.utcTimeStamp
        }&key=${this.props.myAPIKey}`
      )
        .then((res) => res.json())
        .then((data) => {
          this.setState({
            selectedLocationTime:
              data.dstOffset + data.rawOffset + this.state.utcTimeStamp,
            selectedLocationTimeZoneName: data.timeZoneName,
          });
          if (data.status === "ZERO_RESULTS") {
            alert(
              "No time zone data could be found for the specified position or time. Confirm that the request is for a location on land, and not over water."
            );
          }
        })
        .catch(() => {
          alert(
            "Fail to get a response from google time zone API. Please check your network and try again."
          );
        });
    };
  }

  componentDidMount() {
    //Set timers to support real-time clocks
    timerUTC = setInterval(() => {
      this.setState({
        utcTimeStamp: this.state.utcTimeStamp + 1,
      });
    }, 1000);
    if (this.state.selectedLocation) {
      this.getTimeZone();
      timerLocalTime = setInterval(() => {
        this.setState({
          selectedLocationTime: this.state.selectedLocationTime + 1,
        });
      }, 1000);
    }
  }
  componentDidUpdate() {
    this.setState({
      previousSelectedLocation: this.state.selectedLocation,
      selectedLocation: this.props.selectedLocation,
    });
    if (
      this.state.previousSelectedLocation.lat !==
      this.state.selectedLocation.lat &&
      this.state.previousSelectedLocation.lng !==
      this.state.selectedLocation.lng
    ) {
      this.getTimeZone();
    }
  }
  componentWillUnmount() {
    clearInterval(timerUTC);
    clearInterval(timerLocalTime);
  }
  render() {
    return (
      <Time>
        <section>
          UTC Time: &nbsp;
          {new Date(this.state.utcTimeStamp * 1000)
            .toUTCString()
            .replace("GMT", "(Coordinated Universal Time)")}
        </section>
        <section>
          Selected Location Time:&nbsp;
          {new Date(new Date(this.state.selectedLocationTime * 1000))
            .toUTCString()
            .replace("GMT", `(${this.state.selectedLocationTimeZoneName})`)}
        </section>
      </Time>
    );
  }
}
