import React, { ReactNode } from "react";
import "./Card.css";

interface CardProps {
  children: ReactNode;
}

const Card: React.FC<CardProps> = (props) => {
  return <div className="card">{props.children}</div>;
};

export default Card;