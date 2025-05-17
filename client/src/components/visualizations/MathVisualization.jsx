import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Slider, Row, Col, Select, Button } from 'antd';
import { FunctionOutlined, ShapeIcon } from '@ant-design/icons';

const { Option } = Select;

const MathVisualization = ({ content, params, onParamChange }) => {
  const svgRef = useRef();
  const [mode, setMode] = useState('geometry'); // 'geometry' 或 'function'

  // 几何图形类型
  const [shape, setShape] = useState('circle');
  // 函数表达式
  const [functionExpr, setFunctionExpr] = useState('Math.sin(x)');

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // 清空画布

    const width = svgRef.current.clientWidth;
    const height = 400;
    svg.attr('width', width).attr('height', height);

    // 创建坐标系
    if (params.showAxis) {
      const xAxis = d3.axisBottom(d3.scaleLinear().domain([-10, 10]).range([0, width]));
      const yAxis = d3.axisLeft(d3.scaleLinear().domain([-1, 1]).range([height, 0]));
      
      svg.append('g')
        .attr('transform', `translate(0, ${height/2})`)
        .call(xAxis);
      
      svg.append('g')
        .attr('transform', `translate(${width/2}, 0)`)
        .call(yAxis);
    }

    // 显示网格
    if (params.showGrid) {
      // 网格绘制逻辑...
    }

    // 根据模式绘制不同内容
    if (mode === 'geometry') {
      drawGeometry(svg, width, height);
    } else {
      drawFunction(svg, width, height);
    }
  }, [params, mode, shape, functionExpr]);

  const drawGeometry = (svg, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * 0.4;

    switch (shape) {
      case 'circle':
        svg.append('circle')
          .attr('cx', centerX)
          .attr('cy', centerY)
          .attr('r', size * params.scale || 1)
          .attr('fill', 'steelblue');
        break;
      case 'rectangle':
        svg.append('rect')
          .attr('x', centerX - size/2)
          .attr('y', centerY - size/2)
          .attr('width', size)
          .attr('height', size * params.aspectRatio || 1)
          .attr('fill', 'green');
        break;
      case 'triangle':
        // 三角形绘制逻辑...
        break;
    }
  };

  const drawFunction = (svg, width, height) => {
    try {
      const x = d3.scaleLinear().domain([-10, 10]).range([0, width]);
      const y = d3.scaleLinear().domain([-1, 1]).range([height, 0]);
      
      const line = d3.line()
        .x(d => x(d.x))
        .y(d => y(eval(functionExpr.replace('x', d.x))));
      
      const data = d3.range(-10, 10, 0.1).map(x => ({ x }));
      
      svg.append('path')
        .datum(data)
        .attr('d', line)
        .attr('stroke', 'red')
        .attr('fill', 'none');
    } catch (e) {
      console.error('函数解析错误:', e);
    }
  };

  return (
    <div className="math-visualization">
      <div className="mode-selector">
        <Button 
          type={mode === 'geometry' ? 'primary' : 'default'}
          icon={<ShapeIcon />}
          onClick={() => setMode('geometry')}
        >
          几何图形
        </Button>
        <Button 
          type={mode === 'function' ? 'primary' : 'default'}
          icon={<FunctionOutlined />}
          onClick={() => setMode('function')}
        >
          函数图像
        </Button>
      </div>

      {mode === 'geometry' ? (
        <div className="geometry-controls">
          <Select
            value={shape}
            onChange={setShape}
            style={{ width: 120 }}
          >
            <Option value="circle">圆形</Option>
            <Option value="rectangle">矩形</Option>
            <Option value="triangle">三角形</Option>
          </Select>
          
          <Slider
            min={0.1}
            max={2}
            step={0.1}
            value={params.scale || 1}
            onChange={value => onParamChange('scale', value)}
          />
        </div>
      ) : (
        <div className="function-controls">
          <Input
            value={functionExpr}
            onChange={e => setFunctionExpr(e.target.value)}
            placeholder="输入函数表达式，如 Math.sin(x)"
          />
        </div>
      )}

      <svg 
        ref={svgRef} 
        style={{ 
          width: '100%', 
          height: '400px',
          border: '1px solid #ddd',
          marginTop: '20px'
        }}
      />
    </div>
  );
};

export default MathVisualization;