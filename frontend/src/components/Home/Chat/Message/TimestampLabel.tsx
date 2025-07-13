import React from "react";

interface TimestampLabelProps {
  dayLabel: string;
  time: string;
}

const TimestampLabel: React.FC<TimestampLabelProps> = ({ dayLabel, time }) => (
  <span className="text-xs text-gray-400">
    {dayLabel} {time}
  </span>
);

export default TimestampLabel;
