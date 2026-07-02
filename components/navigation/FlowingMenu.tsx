import Link from "next/link";

import styles from "./FlowingMenu.module.css";

interface FlowingMenuItem {
  link: string;
  text: string;
}

interface FlowingMenuProps {
  items: FlowingMenuItem[];
  textColor?: string;
  borderColor?: string;
}

export default function FlowingMenu({
  items,
  textColor = "#111111",
  borderColor = "#d7d4cf"
}: FlowingMenuProps) {
  return (
    <div className={styles.menuWrap}>
      <nav className={styles.menu}>
        {items.map((item, index) => (
          <div className={styles.menuItem} key={`${item.text}-${index}`} style={{ borderColor }}>
            <Link className={styles.menuItemLink} href={item.link} style={{ color: textColor }}>
              {item.text}
            </Link>
          </div>
        ))}
      </nav>
    </div>
  );
}
