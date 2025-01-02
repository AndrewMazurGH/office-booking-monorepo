// apps/office-booking-web/src/app/types/css.d.ts

declare module '*.css' {
    const classes: {
        readonly [key: string]: string;
        // Shared styles
        readonly pageContainer: string;
        readonly card: string;
        readonly header: string;
        readonly title: string;
        readonly button: string;
        readonly input: string;
        readonly select: string;
        readonly error: string;
        readonly success: string;
        readonly table: string;
        readonly badge: string;

        // Admin layout styles
        readonly adminContainer: string;
        readonly headerContent: string;
        readonly logo: string;
        readonly logoText: string;
        readonly nav: string;
        readonly navLink: string;
        readonly active: string;
        readonly signOutButton: string;
        readonly content: string;

        // Form styles
        readonly formGroup: string;
        readonly label: string;
        readonly input: string;
        readonly textarea: string;
        readonly checkbox: string;
        readonly buttonSecondary: string;
        readonly modalActions: string;

        // Table styles
        readonly tableControls: string;
        readonly badgeSuccess: string;
        readonly badgeWarning: string;
        readonly badgeError: string;
        readonly badgeInfo: string;
    };
    export default classes;
}