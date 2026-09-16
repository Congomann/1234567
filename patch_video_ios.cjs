const fs = require('fs');

let home = fs.readFileSync('pages/website/Home.tsx', 'utf8');

// Add useRef if not present
if (!home.includes('useRef')) {
  home = home.replace(/import React, {([^}]*)} from 'react'/, "import React, { useRef, $1 } from 'react'");
}

// Add the videoRef
if (!home.includes('videoRef = useRef')) {
  home = home.replace(
    /const \[currentVideoIndex, setCurrentVideoIndex\] = useState\(0\);/,
    "const [currentVideoIndex, setCurrentVideoIndex] = useState(0);\n  const videoRef = useRef<HTMLVideoElement>(null);\n\n  useEffect(() => {\n    if (videoRef.current) {\n      videoRef.current.defaultMuted = true;\n      videoRef.current.muted = true;\n      videoRef.current.play().catch(e => console.log('Autoplay prevented by iOS:', e));\n    }\n  }, [currentVideoIndex]);"
  );
}

// Replace the video tag to use the ref, and enforce attributes
home = home.replace(
  /<video\s+key=\{currentVideoSrc\}\s+src=\{currentVideoSrc\}\s+autoPlay\s+muted=\{isMuted\}\s+playsInline\s+onEnded=\{handleVideoEnded\}\s+loop=\{playlist\.length <= 1\}\s+className="absolute inset-0 w-full h-full object-cover"\s*\/>/,
  `<video
              ref={videoRef}
              key={currentVideoSrc}
              src={currentVideoSrc}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnded}
              loop={playlist.length <= 1}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ objectFit: 'cover' }}
            />`
);

fs.writeFileSync('pages/website/Home.tsx', home);
console.log('Patched iOS video autoplay issues');
