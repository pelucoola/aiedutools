import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Slider, Select, Button, Row, Col } from 'antd';
import { ExperimentOutlined, BulbOutlined } from '@ant-design/icons';

const { Option } = Select;

const PhysicsVisualization = ({ content, params, onParamChange }) => {
  const containerRef = useRef();
  const [scene, setScene] = useState(null);
  const [mode, setMode] = useState('mechanics'); // 'mechanics' 或 'optics'
  const [simulation, setSimulation] = useState(null);

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
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 5, 5);
    newScene.add(light);
    newScene.add(new THREE.AmbientLight(0x404040));

    // 添加轨道控制器
    const controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 5, 10);
    controls.update();

    setScene(newScene);

    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(newScene, camera);
      controls.update();
      
      // 更新模拟
      if (simulation) {
        simulation.update();
      }
    };
    animate();

    return () => {
      containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // 根据模式设置模拟
  useEffect(() => {
    if (!scene) return;

    // 清空场景
    while(scene.children.length > 0){ 
      scene.remove(scene.children[0]); 
    }

    if (mode === 'mechanics') {
      setupMechanicsSimulation();
    } else {
      setupOpticsSimulation();
    }
  }, [mode, params]);

  const setupMechanicsSimulation = () => {
    // 创建力学模拟
    const gravity = params.gravity || 9.8;
    const friction = params.friction || 0.1;
    
    // 创建平面
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xcccccc,
      side: THREE.DoubleSide 
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    scene.add(plane);

    // 创建物体
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(0, 5, 0);
    scene.add(box);

    // 简单的物理模拟
    const sim = {
      objects: [box],
      update: () => {
        box.position.y -= gravity * 0.01;
        if (box.position.y <= 0.5) {
          box.position.y = 0.5;
        }
      }
    };
    setSimulation(sim);
  };

  const setupOpticsSimulation = () => {
    // 创建光学实验场景
    const lightSource = new THREE.PointLight(0xffff00, 1, 10);
    lightSource.position.set(-5, 2, 0);
    scene.add(lightSource);

    // 创建透镜
    const lensGeometry = new THREE.CylinderGeometry(1, 1, 0.2, 32);
    const lensMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xffffff,
      transparent: true,
      opacity: 0.7
    });
    const lens = new THREE.Mesh(lensGeometry, lensMaterial);
    lens.position.set(0, 2, 0);
    scene.add(lens);

    // 创建屏幕
    const screenGeometry = new THREE.PlaneGeometry(10, 10);
    const screenMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x333333,
      side: THREE.DoubleSide 
    });
    const screen = new THREE.Mesh(screenGeometry, screenMaterial);
    screen.position.set(5, 2, 0);
    screen.rotation.y = Math.PI / 2;
    scene.add(screen);
  };

  return (
    <div className="physics-visualization">
      <div className="mode-selector">
        <Button 
          type={mode === 'mechanics' ? 'primary' : 'default'}
          icon={<ExperimentOutlined />}
          onClick={() => setMode('mechanics')}
        >
          力学模拟
        </Button>
        <Button 
          type={mode === 'optics' ? 'primary' : 'default'}
          icon={<BulbOutlined />}
          onClick={() => setMode('optics')}
        >
          光学实验
        </Button>
      </div>

      {mode === 'mechanics' && (
        <div className="mechanics-controls">
          <Row gutter={16}>
            <Col span={12}>
              <Slider
                min={0}
                max={20}
                step={0.1}
                value={params.gravity || 9.8}
                onChange={value => onParamChange('gravity', value)}
                tipFormatter={value => `重力加速度: ${value}m/s²`}
              />
            </Col>
            <Col span={12}>
              <Slider
                min={0}
                max={1}
                step={0.01}
                value={params.friction || 0.1}
                onChange={value => onParamChange('friction', value)}
                tipFormatter={value => `摩擦系数: ${value}`}
              />
            </Col>
          </Row>
        </div>
      )}

      {mode === 'optics' && (
        <div className="optics-controls">
          <Select
            defaultValue="convex"
            style={{ width: 120 }}
          >
            <Option value="convex">凸透镜</Option>
            <Option value="concave">凹透镜</Option>
            <Option value="prism">棱镜</Option>
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

export default PhysicsVisualization;