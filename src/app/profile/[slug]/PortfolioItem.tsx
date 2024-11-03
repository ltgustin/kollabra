// PortfolioItem.tsx
import React from 'react';
import { ImageListItem, Box, Typography, IconButton, Chip } from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const PortfolioItem = ({ item, onEdit, onDelete }) => {
    return (
        <ImageListItem>
            <Box>
                <img src={item.imageUrls[0]} alt={item.title} loading="lazy" />
                <Box>
                    <Typography variant="h4">{item.title} | {item.brand}</Typography>
                    <Typography variant="body1">{item.description}</Typography>
                    <Box>
                        {item.categories.map(category => (
                            <Chip key={category} label={category} />
                        ))}
                    </Box>
                    <Box>
                        <IconButton onClick={() => onEdit(item.id)}><EditIcon /></IconButton>
                        <IconButton onClick={() => onDelete(item.id)}><DeleteIcon /></IconButton>
                    </Box>
                </Box>
            </Box>
        </ImageListItem>
    );
};

export default PortfolioItem;