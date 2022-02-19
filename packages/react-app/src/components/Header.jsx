import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/dec3ntraliz3d/meta-multi-sig-wallet " target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🏗 Meta-Multisig-Wallet"
        subTitle="by @dec3ntraliz3d"
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
