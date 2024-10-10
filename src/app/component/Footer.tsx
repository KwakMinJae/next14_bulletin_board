"use client";
import { useState } from 'react';
import styles from './Footer.module.scss';
import Icon from './Icon';

const Footer = () => {
    const [isOpen, setIsOpen] = useState(false); // 설명 내용을 토글하기 위한 상태

    const handleToggle = () => {
        setIsOpen(!isOpen); // 버튼 클릭 시 토글 상태 변경
    };

    return (
        <>
            <div className="mx-64 my-6">
                <div className={styles.footer}>
                    <a href="#none" onClick={handleToggle} className={styles.infoButton}>
                        <Icon name="bang" className="w-6 h-6 text-black-500" />
                    </a>
                    {isOpen && (
                        <div className={styles.tooltip}>
                            <span>favicon 출처: </span>
                            <a href="https://www.flaticon.com/kr/free-icons/" title="구름 아이콘" className='hover:text-blue-700'>
                                구름 아이콘 제작자: iconixar - Flaticon
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Footer;
