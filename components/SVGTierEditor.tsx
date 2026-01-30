"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TierBoundaries, TierConfig } from '@/types';
import { storage } from '@/lib/storage';
import { SVG_TIER_CONFIG } from './SVGSeatMap';
import { Button } from '@/components/ui/Button';

interface SVGTierEditorProps {
    eventId: string;
    onSave?: (boundaries: TierBoundaries) => void;
}

// Tier colors for visualization
const TIER_COLORS = {
    premium: 'rgba(255, 0, 0, 0.2)',     // Red
    gold: 'rgba(128, 0, 128, 0.2)',      // Purple
    silver: 'rgba(0, 0, 255, 0.2)',      // Blue
    bronze: 'rgba(0, 128, 128, 0.2)',    // Teal
    normal: 'rgba(0, 0, 0, 0.1)',        // Black/Gray
};

const TIER_LINE_COLORS = {
    premium: '#FF0000',
    gold: '#800080',
    silver: '#0000FF',
    bronze: '#008080',
};

export default function SVGTierEditor({ eventId, onSave }: SVGTierEditorProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svgContent, setSvgContent] = useState<string>('');
    const [boundaries, setBoundaries] = useState<TierBoundaries | null>(null);
    const [draggingBoundary, setDraggingBoundary] = useState<keyof TierBoundaries | null>(null);
    const [seatCounts, setSeatCounts] = useState<Record<string, number>>({});
    const [hasChanges, setHasChanges] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const svgRef = useRef<SVGSVGElement | null>(null);

    // Load SVG and boundaries
    useEffect(() => {
        // Load SVG
        fetch('/Uvenue_Seatmap.svg')
            .then(response => response.text())
            .then(text => setSvgContent(text))
            .catch(err => console.error('Failed to load SVG:', err));

        // Load event-specific boundaries
        storage.getTierBoundaries(eventId).then(b => {
            setBoundaries(b);
        });
    }, [eventId]);

    // Count seats per tier based on current boundaries
    const countSeatsPerTier = useCallback((b: TierBoundaries) => {
        if (!containerRef.current) return;

        const svg = containerRef.current.querySelector('svg');
        if (!svg) return;

        const rects = svg.querySelectorAll('rect[rx="4"]');
        const counts: Record<string, number> = {
            premium: 0,
            gold: 0,
            silver: 0,
            bronze: 0,
            normal: 0
        };

        rects.forEach(rect => {
            const y = parseFloat(rect.getAttribute('y') || '0');

            if (y < b.premium) counts.premium++;
            else if (y < b.gold) counts.gold++;
            else if (y < b.silver) counts.silver++;
            else if (y < b.bronze) counts.bronze++;
            else counts.normal++;
        });

        setSeatCounts(counts);
    }, []);

    // Process SVG and add overlays
    useEffect(() => {
        if (!svgContent || !containerRef.current || !boundaries) return;

        const container = containerRef.current;
        container.innerHTML = svgContent;

        const svg = container.querySelector('svg');
        if (!svg) return;
        svgRef.current = svg;

        // Make SVG responsive
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', 'auto');
        svg.style.maxWidth = '100%';

        // Get SVG dimensions
        const viewBox = svg.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 1608, 1468];
        const svgHeight = viewBox[3];
        const svgWidth = viewBox[2];

        // Create overlay group for tier zones and handles
        const overlayGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        overlayGroup.setAttribute('id', 'tier-overlay');

        // Add tier zone rectangles
        const zones = [
            { name: 'premium', top: 0, bottom: boundaries.premium, color: TIER_COLORS.premium },
            { name: 'gold', top: boundaries.premium, bottom: boundaries.gold, color: TIER_COLORS.gold },
            { name: 'silver', top: boundaries.gold, bottom: boundaries.silver, color: TIER_COLORS.silver },
            { name: 'bronze', top: boundaries.silver, bottom: boundaries.bronze, color: TIER_COLORS.bronze },
            { name: 'normal', top: boundaries.bronze, bottom: svgHeight, color: TIER_COLORS.normal },
        ];

        zones.forEach(zone => {
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', '0');
            rect.setAttribute('y', zone.top.toString());
            rect.setAttribute('width', svgWidth.toString());
            rect.setAttribute('height', (zone.bottom - zone.top).toString());
            rect.setAttribute('fill', zone.color);
            rect.setAttribute('pointer-events', 'none');
            overlayGroup.appendChild(rect);
        });

        // Add draggable boundary lines
        const boundaryKeys: (keyof TierBoundaries)[] = ['premium', 'gold', 'silver', 'bronze'];
        boundaryKeys.forEach((key) => {
            const y = boundaries[key];
            const color = TIER_LINE_COLORS[key];

            // Line
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', '0');
            line.setAttribute('y1', y.toString());
            line.setAttribute('x2', svgWidth.toString());
            line.setAttribute('y2', y.toString());
            line.setAttribute('stroke', color);
            line.setAttribute('stroke-width', '4');
            line.setAttribute('stroke-dasharray', '10,5');
            line.style.cursor = 'ns-resize';
            line.setAttribute('data-boundary', key);
            overlayGroup.appendChild(line);

            // Handle circle
            const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            handle.setAttribute('cx', (svgWidth / 2).toString());
            handle.setAttribute('cy', y.toString());
            handle.setAttribute('r', '12');
            handle.setAttribute('fill', color);
            handle.setAttribute('stroke', 'white');
            handle.setAttribute('stroke-width', '3');
            handle.style.cursor = 'ns-resize';
            handle.setAttribute('data-boundary', key);
            overlayGroup.appendChild(handle);

            // Label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', (svgWidth / 2 + 20).toString());
            label.setAttribute('y', (y + 5).toString());
            label.setAttribute('fill', color);
            label.setAttribute('font-size', '16');
            label.setAttribute('font-weight', 'bold');
            label.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)} (${Math.round(y)})`;
            label.setAttribute('data-boundary-label', key);
            overlayGroup.appendChild(label);
        });

        svg.appendChild(overlayGroup);

        // Count seats
        countSeatsPerTier(boundaries);

        // Add mouse event handlers for dragging
        const handleMouseDown = (e: MouseEvent) => {
            const target = e.target as SVGElement;
            const boundary = target.getAttribute('data-boundary') as keyof TierBoundaries | null;
            if (boundary) {
                setDraggingBoundary(boundary);
                e.preventDefault();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!draggingBoundary || !svgRef.current || !boundaries) return;

            const svg = svgRef.current;
            const rect = svg.getBoundingClientRect();
            const viewBox = svg.getAttribute('viewBox')?.split(' ').map(Number) || [0, 0, 1608, 1468];

            // Convert screen coordinates to SVG coordinates
            const scale = viewBox[3] / rect.height;
            const newY = Math.max(50, Math.min(viewBox[3] - 50, (e.clientY - rect.top) * scale));

            // Update boundaries with constraints
            const newBoundaries = { ...boundaries };

            switch (draggingBoundary) {
                case 'premium':
                    newBoundaries.premium = Math.min(newY, boundaries.gold - 50);
                    break;
                case 'gold':
                    newBoundaries.gold = Math.max(boundaries.premium + 50, Math.min(newY, boundaries.silver - 50));
                    break;
                case 'silver':
                    newBoundaries.silver = Math.max(boundaries.gold + 50, Math.min(newY, boundaries.bronze - 50));
                    break;
                case 'bronze':
                    newBoundaries.bronze = Math.max(boundaries.silver + 50, newY);
                    break;
            }

            setBoundaries(newBoundaries);
            setHasChanges(true);
        };

        const handleMouseUp = () => {
            setDraggingBoundary(null);
        };

        svg.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            svg.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [svgContent, boundaries, draggingBoundary, countSeatsPerTier]);

    // Handle save
    const handleSave = async () => {
        if (!boundaries) return;
        setIsSaving(true);
        await storage.saveTierBoundaries(eventId, boundaries);
        setHasChanges(false);
        setIsSaving(false);
        onSave?.(boundaries);
    };

    // Handle reset
    const handleReset = async () => {
        const defaultBoundaries = await storage.resetTierBoundaries(eventId);
        setBoundaries(defaultBoundaries);
        setHasChanges(false);
    };

    if (!boundaries) {
        return <div className="flex items-center justify-center h-64">Loading...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        Drag the colored lines to adjust tier boundaries
                    </span>
                    {hasChanges && (
                        <span className="text-sm text-amber-600 font-medium">
                            • Unsaved changes
                        </span>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleReset}
                        disabled={isSaving}
                    >
                        Reset to Default
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            {/* Seat counts per tier */}
            <div className="grid grid-cols-5 gap-2">
                {Object.entries(seatCounts).map(([tier, count]) => {
                    const tierInfo = SVG_TIER_CONFIG.find(t => t.id === tier);
                    return (
                        <div
                            key={tier}
                            className="p-3 rounded-lg text-center"
                            style={{ backgroundColor: `${tierInfo?.color}20` }}
                        >
                            <div className="text-2xl font-bold" style={{ color: tierInfo?.color }}>
                                {count}
                            </div>
                            <div className="text-xs text-gray-600 capitalize">{tier} seats</div>
                        </div>
                    );
                })}
            </div>

            {/* SVG Editor */}
            <div
                ref={containerRef}
                className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white"
                style={{
                    cursor: draggingBoundary ? 'ns-resize' : 'default'
                }}
            />

            {/* Instructions */}
            <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg">
                <strong>How to use:</strong>
                <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>Drag the colored boundary lines up or down to resize tier zones</li>
                    <li>Seats above a line belong to the tier marked by that line</li>
                    <li>Click "Save Changes" to apply your layout to this event</li>
                    <li>Each event has its own independent layout - changes don't affect other events</li>
                </ul>
            </div>
        </div>
    );
}
