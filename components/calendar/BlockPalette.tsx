import React, { useState } from 'react';
import { motion } from 'framer-motion';

// ─── Config ───────────────────────────────────────────────────────────────────
export type BlockType = 'meeting' | 'task' | 'reminder' | 'off-day';

interface BlockDef {
    type: BlockType;
    emoji: string;
    label: string;
    description: string;
    bg: string;
    border: string;
    line: string;
    textColor: string;
    tagBg: string;
}

const BLOCKS: BlockDef[] = [
    {
        type: 'meeting',
        emoji: '📅',
        label: 'Meeting',
        description: 'Schedule a team or client meeting',
        bg: '#f4f0ff',
        border: '#ddd6fe',
        line: '#8b5cf6',
        textColor: '#5b21b6',
        tagBg: '#ede9fe',
    },
    {
        type: 'task',
        emoji: '✅',
        label: 'Task',
        description: 'Add a task or deliverable',
        bg: '#eff6ff',
        border: '#bfdbfe',
        line: '#3b82f6',
        textColor: '#1d4ed8',
        tagBg: '#dbeafe',
    },
    {
        type: 'reminder',
        emoji: '🔔',
        label: 'Reminder',
        description: 'Set a personal reminder',
        bg: '#fff0f3',
        border: '#fecdd3',
        line: '#f43f5e',
        textColor: '#be123c',
        tagBg: '#ffe4e6',
    },
    {
        type: 'off-day',
        emoji: '🏖️',
        label: 'Off Day',
        description: 'Mark a day off or vacation',
        bg: '#ecfdf5',
        border: '#a7f3d0',
        line: '#10b981',
        textColor: '#065f46',
        tagBg: '#d1fae5',
    },
];

const DRAG_KEY = 'palette/blockType';

// ─── Component ────────────────────────────────────────────────────────────────
export const BlockPalette: React.FC = () => {
    const [dragging, setDragging] = useState<BlockType | null>(null);

    return (
        <div style={{ padding: '0 0 20px' }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                marginBottom: 14,
                padding: '16px 20px 0',
            }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Quick Add</span>
                <span style={{
                    fontSize: 11, fontWeight: 500, color: '#9ca3af',
                    background: '#f1f5f9', borderRadius: 6, padding: '2px 8px',
                }}>Drag onto calendar</span>
            </div>

            {/* Grid of blocks */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 10, padding: '0 14px',
            }}>
                {BLOCKS.map((block) => (
                    <motion.div
                        key={block.type}
                        draggable
                        onDragStart={(e: any) => {
                            e.dataTransfer.setData(DRAG_KEY, block.type);
                            e.dataTransfer.setData(
                                'text/plain',
                                JSON.stringify({ type: 'palette', blockType: block.type })
                            );
                            e.dataTransfer.effectAllowed = 'copy';
                            setDragging(block.type);
                        }}
                        onDragEnd={() => setDragging(null)}
                        whileHover={{ scale: 1.03, boxShadow: `0 6px 20px ${block.line}28` }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            backgroundColor: block.bg,
                            border: `1.5px solid ${dragging === block.type ? block.line : block.border}`,
                            borderRadius: 14,
                            padding: '12px 12px 10px',
                            cursor: 'grab',
                            userSelect: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 6,
                            boxShadow: dragging === block.type
                                ? `0 4px 14px ${block.line}30`
                                : '0 1px 3px rgba(0,0,0,0.05)',
                            transition: 'border-color 0.15s, box-shadow 0.15s',
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Left accent bar */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, bottom: 0,
                            width: 3.5, backgroundColor: block.line, borderRadius: '14px 0 0 14px',
                        }} />

                        {/* Emoji */}
                        <span style={{ fontSize: 22, lineHeight: 1, paddingLeft: 8 }}>
                            {block.emoji}
                        </span>

                        {/* Label */}
                        <span style={{
                            fontSize: 13, fontWeight: 700, color: block.textColor,
                            paddingLeft: 8, lineHeight: 1.2,
                        }}>
                            {block.label}
                        </span>

                        {/* Description */}
                        <span style={{
                            fontSize: 10.5, color: '#6b7280', lineHeight: 1.35,
                            paddingLeft: 8,
                        }}>
                            {block.description}
                        </span>

                        {/* Drag hint chip */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            paddingLeft: 8, marginTop: 2,
                        }}>
                            <span style={{
                                fontSize: 9.5, fontWeight: 600,
                                color: block.textColor,
                                backgroundColor: block.tagBg,
                                padding: '2px 7px', borderRadius: 99,
                                letterSpacing: 0.3,
                            }}>
                                ⠿ drag to add
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Divider */}
            <div style={{
                height: 1, backgroundColor: '#f1f5f9',
                margin: '20px 14px 0',
            }} />
        </div>
    );
};

// Export the drag key so Calendar.tsx can read it
export { DRAG_KEY };
