
interface FloatingLogosProps {
    logos: string[];
}

import 'react';

declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number
    }
}

export default function FloatingLogos(params: FloatingLogosProps) {
    const {logos = []} = params;
    return <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center overflow-hidden">
        {logos.map((logo, index) => {
            const inside_radius = 0.05;
            const outside_radius = 0.2;

            // Distribute logos in a donut using polar coordinates
            const theta = 2*Math.PI * Math.random();
            const dist = Math.sqrt(Math.random() * (outside_radius-inside_radius)+inside_radius);
            // Convert back to cartesian coordinates
            let x_pos = (dist * Math.cos(theta) +0.5) * 100;
            let y_pos = (dist * Math.sin(theta) +0.5) * 100;

            return <img key={index} src={logo} alt="logo" className="absolute w-10 opacity-70 rounded grayscale-75" style={{top: `${y_pos}%`, left: `${x_pos}%`}} />
        })}
    </div>
}
