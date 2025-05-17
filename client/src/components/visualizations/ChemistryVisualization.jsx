import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Slider, Switch, Button, Row, Col } from 'antd';
import { ExperimentOutlined, AtomIcon } from '@ant-design/icons';

const ChemistryVisualization = ({ content, params, onParamChange }) => {
  const containerRef = useRef();
  const [scene, setScene] = useState(null);
  const [mode, setMode] = useState('molecule'); // 'molecule' 或 'reaction'
  const [molecule, setMolecule] = useState('water'); // 默认水分子

  // 分子数据
  const molecules = {
    water: {
      atoms: [
        { element: 'O', x: 0, y: 0, z: 0 },
        { element: 'H', x: 0.76, y: 0.58, z: 0 },
        { element: 'H', x: -0.76, y: 0.58, z: 0 }
      ],
      bonds: [
        { from: 0, to: 1 },
        { from: 0, to: 2 }
      ]
    },
    methane: {
      atoms: [
        { element: 'C', x: 0, y: 0, z: 0 },
        { element: 'H', x: 0.63, y: 0.63, z: 0.63 },
        { element: 'H', x: -0.63, y: -0.63, z: 0.63 },
        { element: 'H', x: -0.63, y: 0.63, z: -0.63 },
        { element: 'H', x: 0.63, y: -0.63, z: -0.63 }
      ],
      bonds: [
        { from: 0, to: 1 },
        { from: 0, to: 2 },
        { from: 0, to: 3 },
        { from: 0, to: 4 }
      ]
    }
  };

  // 原子颜色映射
  const atomColors = {
    H: 0xffffff, // 白色
    O: 0xff0000, // 红色
    C: 0x333333  // 黑色
  };

  // 原子半径
  const atomSizes = {
    H: 0.3,
    O: 0.5,
    C: 0.4
  };

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
    camera.position.set(0, 0, 5);
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

  // 根据模式渲染分子或反应
  useEffect(() => {
    if (!scene) return;

    // 清空场景
    while(scene.children.length > 0){ 
      scene.remove(scene.children[0]); 
    }

    if (mode === 'molecule') {
      renderMolecule();
    } else {
      renderReaction();
    }
  }, [scene, mode, molecule, params]);

  const renderMolecule = () => {
    const currentMolecule = molecules[molecule] || molecules.water;

    // 创建原子
    currentMolecule.atoms.forEach(atom => {
      const geometry = new THREE.SphereGeometry(atomSizes[atom.element] * (params.atomScale || 1), 32, 32);
      const material = new THREE.MeshPhongMaterial({ 
        color: atomColors[atom.element],
        transparent: params.showElectrons,
        opacity: params.showElectrons ? 0.7 : 1.0
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(atom.x, atom.y, atom.z);
      scene.add(sphere);
    });

    // 创建键
    currentMolecule.bonds.forEach(bond => {
      const from = currentMolecule.atoms[bond.from];
      const to = currentMolecule.atoms[bond.to];
      
      const distance = Math.sqrt(
        Math.pow(to.x - from.x, 2) + 
        Math.pow(to.y - from.y, 2) + 
        Math.pow(to.z - from.z, 2)
      );
      
      const midPoint = {
        x: (from.x + to.x) / 2,
        y: (from.y + to.y) / 2,
        z: (from.z + to.z) / 2
      };
      
      const direction = new THREE.Vector3(
        to.x - from.x,
        to.y - from.y,
        to.z - from.z
      ).normalize();
      
      const quaternion = new THREE.Quaternion();
      quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction
      );
      
      const geometry = new THREE.CylinderGeometry(
        0.1 * (params.bondScale || 1),
        0.1 * (params.bondScale || 1),
        distance,
        8
      );
      const material = new THREE.MeshPhongMaterial({ color: 0xcccccc });
      const cylinder = new THREE.Mesh(geometry, material);
      cylinder.position.set(midPoint.x, midPoint.y, midPoint.z);
      cylinder.setRotationFromQuaternion(quaternion);
      scene.add(cylinder);
    });
  };

  const renderReaction = () => {
    // 实现化学反应动画
    // 这里可以添加反应物到生成物的动画过渡
  };

  return (
    <div className="chemistry-visualization">
      <div className="mode-selector">
        <Button 
          type={mode === 'molecule' ? 'primary' : 'default'}
          icon={<AtomIcon />}
          onClick={() => setMode('molecule')}
        >
          分子结构
        </Button>
        <Button 
          type={mode === 'reaction' ? 'primary' : 'default'}
          icon={<ExperimentOutlined />}
          onClick={() => setMode('reaction')}
        >
          化学反应
        </Button>
      </div>

      {mode === 'molecule' && (
        <div className="molecule-controls">
          <Row gutter={16}>
            <Col span={8}>
              <Select
                value={molecule}
                onChange={setMolecule}
                style={{ width: '100%' }}
              >
                <Option value="water">水分子 (H₂O)</Option>
                <Option value="methane">甲烷 (CH₄)</Option>
              </Select>
            </Col>
            <Col span={8}>
              <Switch
                checked={params.showElectrons}
                onChange={checked => onParamChange('showElectrons', checked)}
                checkedChildren="显示电子"
                unCheckedChildren="隐藏电子"
              />
            </Col>
            <Col span={8}>
              <Switch
                checked={params.moleculeRotation}
                onChange={checked => onParamChange('moleculeRotation', checked)}
                checkedChildren="旋转"
                unCheckedChildren="静止"
              />
            </Col>
          </Row>
        </div>
      )}

      {mode === 'reaction' && (
        <div className="reaction-controls">
          {/* 化学反应控制选项 */}
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

export default ChemistryVisualization;