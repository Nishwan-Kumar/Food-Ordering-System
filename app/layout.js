import './globals.css';

export const metadata = {
    title: 'Food Ordering — RBAC System',
    description: 'Full-stack Food Ordering System with Role-Based Access Control',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
