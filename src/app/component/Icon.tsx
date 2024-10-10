import React from 'react';

type IconProps = {
  name: 'login' | 'logout' | 'signup' | 'cloud' | 'bang' | 'dots_vertical';
  className?: string; // 추가적으로 클래스명을 받아서 스타일을 줄 수 있습니다.
};

const Icon: React.FC<IconProps> = ({ name, className }) => {
  switch (name) {
    case 'login':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={className} viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-2a.5.5 0 0 0-1 0v2A1.5 1.5 0 0 0 6.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-8A1.5 1.5 0 0 0 5 3.5v2a.5.5 0 0 0 1 0z"/>
            <path fill-rule="evenodd" d="M11.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H1.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
        </svg>
        );
    case 'logout':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={className} viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"/>
            <path fill-rule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"/>
        </svg>
        );
    case 'signup':
        return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={className} viewBox="0 0 16 16">
            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
            <path fill-rule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
          </svg>
        );
    case 'cloud':
        return (
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <g clip-path="url(#clip0_102_12)">
            <path d="M11.4733 9C11.3608 7.98614 10.9072 7.04058 10.1868 6.31836C9.46638 5.59614 8.52198 5.14011 7.5084 5.02504C6.49483 4.90997 5.47223 5.14268 4.60827 5.68502C3.7443 6.22737 3.09024 7.04716 2.75331 8.01C1.98126 8.07319 1.26357 8.43258 0.750479 9.01293C0.237391 9.59329 -0.031319 10.3496 0.000596555 11.1236C0.0325121 11.8976 0.362579 12.6292 0.921706 13.1654C1.48083 13.7015 2.22567 14.0006 3.00031 14H11.5003C12.1634 13.9964 12.7978 13.7296 13.2641 13.2582C13.7304 12.7868 13.9904 12.1495 13.9868 11.4865C13.9832 10.8235 13.7164 10.189 13.245 9.72268C12.7737 9.25638 12.1364 8.99642 11.4733 9Z" fill="url(#paint0_linear_102_12)"/>
            <path d="M14.5444 9.77202C14.308 9.35523 13.9886 8.99142 13.6058 8.70313C13.2231 8.41483 12.7853 8.2082 12.3194 8.09602C11.9647 6.7514 11.1139 5.59106 9.93812 4.84852C8.76235 4.10599 7.34896 3.8364 5.98242 4.09402C6.36591 3.38783 6.95311 2.81345 7.66759 2.44564C8.38207 2.07783 9.19073 1.93363 9.9883 2.03182C10.7859 2.13001 11.5354 2.46603 12.1394 2.99614C12.7433 3.52625 13.1737 4.22591 13.3744 5.00402C13.955 4.97438 14.5277 5.14797 14.9941 5.49493C15.4605 5.8419 15.7914 6.34054 15.9299 6.9051C16.0684 7.46965 16.0058 8.06483 15.753 8.58825C15.5001 9.11167 15.0728 9.52961 14.5444 9.77202Z" fill="url(#paint1_linear_102_12)"/>
            </g>
            <defs>
            <linearGradient id="paint0_linear_102_12" x1="1.41224" y1="4.99631" x2="12.5727" y2="14" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F8BBD0"/>
            <stop offset="0.25" stop-color="#FFCCCC"/>
            <stop offset="0.5" stop-color="#B3E5FC"/>
            <stop offset="0.75" stop-color="#FFECB3"/>
            <stop offset="1" stop-color="#FFF176"/>
            </linearGradient>
            <linearGradient id="paint1_linear_102_12" x1="10.9922" y1="2.00183" x2="10.9922" y2="9.77302" gradientUnits="userSpaceOnUse">
            <stop stop-color="#F8BBD0"/>
            <stop offset="0.25" stop-color="#FFCCCC"/>
            <stop offset="0.5" stop-color="#B3E5FC"/>
            <stop offset="0.75" stop-color="#FFECB3"/>
            <stop offset="1" stop-color="#FFF176"/>
            </linearGradient>
            <clipPath id="clip0_102_12">
            <rect width="16" height="16" fill="white"/>
            </clipPath>
            </defs>
        </svg>
        );
    case 'bang':
        return (
            // <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            // <circle cx="12" cy="12" r="12" fill="black"/>
            // <text x="12" y="16" text-anchor="middle" fill="white" font-size="16" font-family="Arial">!</text>
            // </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={className} viewBox="0 0 16 16">
                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
            </svg>
        )
    case 'dots_vertical':
      return(
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className={className} viewBox="0 0 16 16">
          <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
        </svg>
      )
    default:
      return null;
  }
};

export default Icon;