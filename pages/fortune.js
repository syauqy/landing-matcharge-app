import React from "react";
import { getWeton } from "@/utils";

export default function Fortune() {
  const birthDate = "1992-07-20";
  const weton = getWeton(birthDate);
  console.log(weton);
  return <div>F</div>;
}
