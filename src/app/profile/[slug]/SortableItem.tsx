import React from 'react';
import { ImageListItem, Box, Typography, Chip, IconButton, Tooltip } from '@mui/material';
import styles from './Profile.module.scss';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon
} from '@mui/icons-material';

interface SortableItemProps {
    item: PortfolioItem;
    editPortfolioItem: (id: string) => void;
    onDelete: (id: string) => void;
    canEditProfile: () => boolean;
}

const SortableItem: React.FC<SortableItemProps> = ({ item, editPortfolioItem, onDelete, canEditProfile }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <ImageListItem
            className={`${styles.portfolioItem} ${isDragging ? styles.dragging : ''}`}
            ref={setNodeRef}
            style={style}
        >
            <Box>
                <Box
                    className={styles.handleBox}
                    {...listeners} // Only apply listeners to the drag handle
                >
                    <Tooltip title="Reorder">
                        <IconButton {...attributes} {...listeners}>
                            <DragIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <img
                    srcSet={`${item.imageUrls[0]}?w=248&fit=crop&auto=format&dpr=2 2x`}
                    src={`${item.imageUrls[0]}?w=248&fit=crop&auto=format`}
                    alt={item.title}
                    loading="lazy"
                />
                <Box className={styles.portfolioItemInfo}>
                    <Typography
                        variant="h4"
                        className={styles.portfolioItemTitle}
                    >{item.title}
                        {item.brand && (
                            ` | ${item.brand}`
                        )}
                    </Typography>
                    <Typography variant="body1">{item.description}</Typography>

                    <Box className={styles.portfolioItemCats}>
                        {item.categories && item.categories.map((category) => (
                            <Chip
                                key={category}
                                label={category}
                                className={styles.portfolioItemCat}
                            />
                        ))}
                    </Box>
                </Box>

                {canEditProfile && (
                    <Box className={styles.actionButtons}>
                        <Tooltip title="Edit">
                            <IconButton onClick={(e) => { e.stopPropagation(); editPortfolioItem(item.id); }}>
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                            <IconButton onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}>
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            </Box>
        </ImageListItem>
    );
};

export default SortableItem;