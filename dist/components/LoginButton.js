'use client';
import React from 'react';
/**
 * Default login button component for Payload admin panel
 * Uses Payload's native button classes to match the design system
 */ export const LoginButton = ({ href, label = 'Login', className, style })=>{
    const handleClick = (e)=>{
        e.preventDefault();
        window.location.href = href;
    };
    // Combine Payload's button classes with any custom classes
    const buttonClasses = [
        'btn',
        'btn--style-primary',
        'btn--icon-style-without-border',
        'btn--size-medium',
        className
    ].filter(Boolean).join(' ');
    return /*#__PURE__*/ React.createElement("div", {
        style: {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '1rem',
            marginBottom: '1rem'
        }
    }, /*#__PURE__*/ React.createElement("a", {
        "aria-label": label,
        className: buttonClasses,
        href: href,
        onClick: handleClick,
        style: style,
        type: "button"
    }, /*#__PURE__*/ React.createElement("span", {
        className: "btn__content"
    }, /*#__PURE__*/ React.createElement("span", {
        className: "btn__label"
    }, label))));
};
