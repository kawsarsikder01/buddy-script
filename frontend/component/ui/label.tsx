 export default function Label({ className, htmlFor, children }: Readonly<{ children: React.ReactNode; className?: string; htmlFor?: string }>) {
    return <label className={`${className ?? "_social_login_label _mar_b8"}`} htmlFor={htmlFor}>
        {children}
    </label>;
}