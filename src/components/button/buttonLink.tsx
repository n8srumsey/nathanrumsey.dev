import * as React from "react"
import {Link } from "gatsby"

import * as styles from "./button.module.scss"

type ButtonLinkProps = {
    props: {
        to: string;
        text: string;
    }
}

const ButtonLink = ({props}: ButtonLinkProps) => {
    return (
        <Link to={props.to} className={styles.button}>
            {props.text}
        </Link>
    )
}

export default ButtonLink;