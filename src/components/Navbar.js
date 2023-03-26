import React from "react"; 

import Link from "next/link";

const Navbar = () => {
    return (
       
        <nav>
 <table style={{marginLeft: "auto", marginRight: "auto"}}  ><thead>
 <tr><th> dd </th><th>
            <ul>
            <Link href="/">Back to home</Link>   
            <Link href="pages/repay.js">Back to home</Link>  
            </ul>
    </th></tr></thead></table>           

            </nav>
    )
}

export default Navbar;