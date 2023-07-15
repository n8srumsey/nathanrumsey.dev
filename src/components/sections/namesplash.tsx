import React from "react"

import * as styles from "./namesplash.module.scss"

const NameSplash = () => {
    return (
        <section id="namesplash" className={styles.section}>
            <h1 className={styles.bigText}> NATHAN RUMSEY</h1>
            <p className={styles.subtitle}> 
                Computer Science Undergraduate at Oregon State University
            </p>
        </section>
    )
}

export default NameSplash