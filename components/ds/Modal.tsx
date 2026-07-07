"use client";

import { AnimatePresence, motion } from "framer-motion";
import styles from "./ds.module.css";

export function Modal({
  title,
  body,
  onClose
}: {
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modalCard}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.94, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
        >
          <div className={styles.modalTitle}>{title}</div>
          <div className={styles.modalBody}>{body}</div>
          <button className={styles.modalClose} onClick={onClose}>
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
