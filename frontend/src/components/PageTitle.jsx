import { useEffect } from "react";

export default function PageTitle({ title }) {

    useEffect(() => {

        document.title = `Quiz Platform - ${title}`;

    }, [title]);

    return null;

}