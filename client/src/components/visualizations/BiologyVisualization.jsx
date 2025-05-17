import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Slider, Select, Button, Row, Col } from 'antd';
import { CellIcon, DnaIcon } from '@ant-design/icons';

const { Option } = Select;

const BiologyVisualization = ({ content, params, onParamChange }) => {
  const containerRef = useRef();
  const [scene, setScene] = useState(null);
  const [mode, setMode] = useState('cell'); // 'cell' 或 'process'
  const [cellType, setCellType] = useState('animal'); // 'animal' 或 'plant'

  // 初始化3D场景
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = 500;

    // 创建场景
    const newScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);

    // 添加光源
    const light1 = new THREE.DirectionalLight(0xffffff, 1);
    light1.position.set(5, 5, 5);
    newScene.add(light1);
    
    const light2 = new THREE.AmbientLight(0x404040);
    newScene.add(light2);

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 10);
    controls.update();

    setScene(newScene);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(newScene, camera);
      controls.update();
    };
    animate();

    return () => {
      containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // 根据模式渲染细胞或生物过程
  useEffect(() => {
    if (!scene) return;

    // 清空场景
    while(scene.children.length > 0){ 
      scene.remove(scene.children[0]); 
    }

    if (mode === 'cell') {
      renderCellStructure();
    } else {
      renderBiologicalProcess();
    }
  }, [scene, mode, cellType, params]);

  const renderCellStructure = () => {
    // 细胞膜
    const membraneGeometry = new THREE.SphereGeometry(3, 32, 32);
    const membraneMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x8888ff,
      transparent: true,
      opacity: 0.3
    });
    const membrane = new THREE.Mesh(membraneGeometry, membraneMaterial);
    scene.add(membrane);

    // 细胞核
    const nucleusGeometry = new THREE.SphereGeometry(1, 32, 32);
    const nucleusMaterial = new THREE.MeshPhongMaterial({ 
      color: cellType === 'animal' ? 0xff8888 : 0x88ff88
    });
    const nucleus = new THREE.Mesh(nucleusGeometry, nucleusMaterial);
    nucleus.position.set(0, 0, 0);
    scene.add(nucleus);

    // 线粒体
    const mitochondriaGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const mitochondriaMaterial = new THREE.MeshPhongMaterial({ color: 0xffcc00 });
    const mitochondria = new THREE.Mesh(mitochondriaGeometry, mitochondriaMaterial);
    mitochondria.position.set(1.5, 1, 0);
    scene.add(mitochondria);

    // 植物细胞特有结构
    if (cellType === 'plant') {
      // 细胞壁
      const wallGeometry = new THREE.SphereGeometry(3.2, 32, 32);
      const wallMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x88aa55,
        wireframe: true
      });
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      scene.add(wall);

      // 叶绿体
      const chloroplastGeometry = new THREE.SphereGeometry(0.6, 32, 32);
      const chloroplastMaterial = new THREE.MeshPhongMaterial({ color: 0x00aa00 });
      const chloroplast = new THREE.Mesh(chloroplastGeometry, chloroplastMaterial);
      chloroplast.position.set(-1, -1, 0);
      scene.add(chloroplast);
    }
  };

  const renderBiologicalProcess = () => {
    // 实现生物过程动画，如有丝分裂、光合作用等
    // 这里可以添加动画效果
  };

  return (
    <div className="biology-visualization">
      <div className="mode-selector">
        <Button 
          type={mode === 'cell' ? 'primary' : 'default'}
          icon={<CellIcon />}
          onClick={() => setMode('cell')}
        >
          细胞结构
        </Button>
        <Button 
          type={mode === 'process' ? 'primary' : 'default'}
          icon={<DnaIcon />}
          onClick={() => setMode('process')}
        >
          生物过程
        </Button>
      </div>

      {mode === 'cell' && (
        <div className="cell-controls">
          <Row gutter={16}>
            <Col span={12}>
              <Select
                value={cellType}
                onChange={setCellType}
                style={{ width: '100%' }}
              >
                <Option value="animal">动物细胞</Option>
                <Option value="plant">植物细胞</Option>
              </Select>
            </Col>
            <Col span={12}>
              <Slider
                min={0.5}
                max={2}
                step={0.1}
                value={params.cellScale || 1}
                onChange={value => onParamChange('cellScale', value)}
                tipFormatter={value => `缩放: ${value}x`}
              />
            </Col>
          </Row>
        </div>
      )}

      {mode === 'process' && (
        <div className="process-controls">
          <Select
            defaultValue="mitosis"
            style={{ width: '100%' }}
          >
            <Option value="mitosis">有丝分裂</Option>
            <Option value="photosynthesis">光合作用</Option>
            <Option value="respiration">呼吸作用</Option>
          </Select>
        </div>
      )}

      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '500px',
          border: '1px solid #ddd',
          marginTop: '20px'
        }}
      />
    </div>
  );
};

export default BiologyVisualization;