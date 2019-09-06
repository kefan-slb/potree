

import {Utils} from "../../utils.js";
import {PointCloudTree} from "../../PointCloudTree.js";
import {Measure} from "../../utils/Measure.js";
import {Profile} from "../../utils/Profile.js";
import {Volume, BoxVolume, SphereVolume} from "../../utils/Volume.js";
import {PointSizeType, PointShape} from "../../defines.js";
import {Gradients} from "../../materials/Gradients.js";

import {MeasurePanel} from "./MeasurePanel.js";
import {DistancePanel} from "./DistancePanel.js";
import {PointPanel} from "./PointPanel.js";
import {AreaPanel} from "./AreaPanel.js";
import {AnglePanel} from "./AnglePanel.js";
import {HeightPanel} from "./HeightPanel.js";
import {VolumePanel} from "./VolumePanel.js";
import {ProfilePanel} from "./ProfilePanel.js";
import {CameraPanel} from "./CameraPanel.js";
import {Viewer} from "../viewer.js";

import {Sidebar} from "../sidebar.js";

export class PropertiesPanel{

	constructor(container, viewer){
		this.container = container;
		this.viewer = viewer;
		this.object = null;
		this.cleanupTasks = [];
		this.scene = null;
	}

	setScene(scene){
		this.scene = scene;
	}

	set(object){
		if(this.object === object){
			return;
		}

		this.object = object;
		
		for(let task of this.cleanupTasks){
			task();
		}
		this.cleanupTasks = [];
		this.container.empty();

		if(object instanceof PointCloudTree){
			this.setPointCloud(object);
		}else if(object instanceof Measure || object instanceof Profile || object instanceof Volume){
			this.setMeasurement(object);
		}else if(object instanceof THREE.Camera){
			this.setCamera(object);
		}
		
	}

	//
	// Used for events that should be removed when the property object changes.
	// This is for listening to materials, scene, point clouds, etc.
	// not required for DOM listeners, since they are automatically cleared by removing the DOM subtree.
	//
	addVolatileListener(target, type, callback){
		target.addEventListener(type, callback);
		this.cleanupTasks.push(() => {
			target.removeEventListener(type, callback);
		});
	}

	setPointCloud(pointcloud){

		let material = pointcloud.material;

		let panel = $(`
			<div class="scene_content selectable">
				<ul class="pv-menu-list">

				<li>
				<span data-i18n="appearance.point_size"></span>:<span id="lblPointSize"></span> <div id="sldPointSize"></div>
				</li>

				<!-- SIZE TYPE -->
				<li>
					<label for="optPointSizing" class="pv-select-label" data-i18n="appearance.point_size_type">Point Sizing </label>
					<select id="optPointSizing" name="optPointSizing">
						<option>FIXED</option>
						<option>ATTENUATED</option>
						<option>ADAPTIVE</option>
					</select>
				</li>

				<!-- SHAPE -->
				<li>
					<label for="optShape" class="pv-select-label" data-i18n="appearance.point_shape"></label><br>
					<select id="optShape" name="optShape">
						<option>SQUARE</option>
						<option>CIRCLE</option>
						<option>PARABOLOID</option>
					</select>
				</li>

				<!-- OPACITY -->
				<li><span data-i18n="appearance.point_opacity"></span>:<span id="lblOpacity"></span><div id="sldOpacity"></div></li>

				<div class="divider">
					<span>Attribute</span>
				</div>

				<li>
					<!--<label for="optMaterial" class="pv-select-label">Attributes:</label><br>-->
					<select id="optMaterial" name="optMaterial">
					</select>
				</li>

				<div id="materials.composite_weight_container">
					<div class="divider">
						<span>Attribute Weights</span>
					</div>

					<li>RGB: <span id="lblWeightRGB"></span> <div id="sldWeightRGB"></div>	</li>
					<li>Intensity: <span id="lblWeightIntensity"></span> <div id="sldWeightIntensity"></div>	</li>
					<li>Elevation: <span id="lblWeightElevation"></span> <div id="sldWeightElevation"></div>	</li>
					<li>Classification: <span id="lblWeightClassification"></span> <div id="sldWeightClassification"></div>	</li>
					<li>Return Number: <span id="lblWeightReturnNumber"></span> <div id="sldWeightReturnNumber"></div>	</li>
					<li>Source ID: <span id="lblWeightSourceID"></span> <div id="sldWeightSourceID"></div>	</li>
				</div>

				<div id="materials.rgb_container">
					<div class="divider">
						<span>RGB</span>
					</div>

					<li>Gamma: <span id="lblRGBGamma"></span> <div id="sldRGBGamma"></div>	</li>
					<li>Brightness: <span id="lblRGBBrightness"></span> <div id="sldRGBBrightness"></div>	</li>
					<li>Contrast: <span id="lblRGBContrast"></span> <div id="sldRGBContrast"></div>	</li>
				</div>

				<div id="materials.color_container">
					<div class="divider">
						<span>Color</span>
					</div>

					<input id="materials.color.picker" />
				</div>


				<div id="materials.elevation_container">
					<div class="divider">
						<span>Elevation</span>
					</div>

					<li><span data-i18n="appearance.elevation_range"></span>: <span id="lblHeightRange"></span> <div id="sldHeightRange"></div>	</li>
					<li>
						<span>Gradient Scheme:</span>
						<div id="elevation_gradient_scheme_selection" style="display: flex">
						<!--
							<span style="flex-grow: 1;">
								<img id="gradient_spectral" class="button-icon" style="max-width: 100%" src="${Potree.resourcePath}/icons/gradients_spectral.png" />
							</span>
							<span style="flex-grow: 1;">
								<img id="gradient_yellow_green" class="button-icon" style="max-width: 100%" src="${Potree.resourcePath}/icons/gradients_yellow_green.png" />
							</span>
							<span style="flex-grow: 1;">
								<img class="button-icon" style="max-width: 100%" src="${Potree.resourcePath}/icons/gradients_plasma.png" />
							</span>
							<span style="flex-grow: 1;">
								<img class="button-icon" style="max-width: 100%" src="${Potree.resourcePath}/icons/gradients_grayscale.png" />
							</span>
							<span style="flex-grow: 1;">
								<img class="button-icon" style="max-width: 100%" src="${Potree.resourcePath}/icons/gradients_rainbow.png" />
							</span>
							-->
						</div>
					</li>
				</div>

				<div id="materials.transition_container">
					<div class="divider">
						<span>Transition</span>
					</div>

					<li>transition: <span id="lblTransition"></span> <div id="sldTransition"></div>	</li>
				</div>

				<div id="materials.intensity_container">
					<div class="divider">
						<span>Intensity</span>
					</div>

					<li>Range: <span id="lblIntensityRange"></span> <div id="sldIntensityRange"></div>	</li>
					<li>Time: <span id="lblIntensityTime"></span> <div id="sldIntensityTime"></div>	</li>
					<li>X: <span id="lblIntensityX"></span> <div id="sldIntensityX"></div>	</li>
					<li>Y: <span id="lblIntensityY"></span> <div id="sldIntensityY"></div>	</li>
					<li>Z: <span id="lblIntensityZ"></span> <div id="sldIntensityZ"></div>	</li>
					<li>Gamma: <span id="lblIntensityGamma"></span> <div id="sldIntensityGamma"></div>	</li>
					<li>Brightness: <span id="lblIntensityBrightness"></span> <div id="sldIntensityBrightness"></div>	</li>
					<li>Contrast: <span id="lblIntensityContrast"></span> <div id="sldIntensityContrast"></div>	</li>
				</div>

				<div id="materials.i_container">
					<div class="divider">
						<span>I</span>
					</div>

					<li>I: <span id="lblI"></span> <div id="sldI"></div>	</li>
				</div>

				<div id="materials.j_container">
					<div class="divider">
						<span>J</span>
					</div>
					
					<li>J: <span id="lblJ"></span> <div id="sldJ"></div>	</li>
				</div>

				<div id="materials.k_container">
					<div class="divider">
						<span>K</span>
					</div>
					
					<li>K: <span id="lblK"></span> <div id="sldK"></div>	</li>
				</div>


				<div id="materials.ijk_container">
					<div class="divider">
						<span>IJK</span>
					</div>

					<!--<li>Intensity Range: <span id="lblValueRange"></span> <div id="sldValueRange"></div></li>-->
					<li>I: <span id="lblIJKI"></span> <div id="sldIJKI"></div>	</li>
					<li>J: <span id="lblIJkJ"></span> <div id="sldIJKJ"></div>	</li>
					<li>K: <span id="lblIJKK"></span> <div id="sldIJKK"></div>	</li>
				</div>

				<div id="materials.gpstime_container">
					<div class="divider">
						<span>GPS Time</span>
					</div>

				</div>
				
				<div id="materials.index_container">
					<div class="divider">
						<span>Indices</span>
					</div>
				</div>


				</ul>
			</div>
		`);

		panel.i18n();
		this.container.append(panel);

		{ // POINT SIZE
			let sldPointSize = panel.find(`#sldPointSize`);
			let lblPointSize = panel.find(`#lblPointSize`);

			sldPointSize.slider({
				value: material.size,
				min: 0,
				max: 3,
				step: 0.01,
				slide: function (event, ui) { material.size = ui.value; }
			});

			let update = (e) => {
				lblPointSize.html(material.size.toFixed(2));
				sldPointSize.slider({value: material.size});
			};
			this.addVolatileListener(material, "point_size_changed", update);
			
			update();
		}

		{ // POINT SIZING
			
			let strSizeType = Object.keys(PointSizeType)[material.pointSizeType];

			let opt = panel.find(`#optPointSizing`);
			opt.selectmenu();
			opt.val(strSizeType).selectmenu('refresh');

			opt.selectmenu({
				change: (event, ui) => {
					material.pointSizeType = PointSizeType[ui.item.value];
				}
			});
		}
		//material.pointType = this.viewer.pointType;

		{ // SHAPE
			let opt = panel.find(`#optShape`);

			opt.selectmenu({
				change: (event, ui) => {
					let value = ui.item.value;

					material.shape = PointShape[value];
				}
			});

			let update = () => {
				let typename = Object.keys(PointShape)[material.shape];

				opt.selectmenu().val(typename).selectmenu('refresh');
			};
			this.addVolatileListener(material, "point_shape_changed", update);

			update();
		}

		{ // OPACITY
			let sldOpacity = panel.find(`#sldOpacity`);
			let lblOpacity = panel.find(`#lblOpacity`);

			sldOpacity.slider({
				value: material.opacity,
				min: 0,
				max: 1,
				step: 0.001,
				slide: function (event, ui) { 
					material.opacity = ui.value;
				}
			});

			let update = (e) => {
				lblOpacity.html(material.opacity.toFixed(2));
				sldOpacity.slider({value: material.opacity});
			};
			this.addVolatileListener(material, "opacity_changed", update);

			update();
		}

		{
			let options = [
				'IJK',
				'I',
				'J',
				'K',
				'RGB',
				'RGB and Elevation',
				'Color',
				'Elevation',
				'Intensity',
				'Intensity Gradient',
				'Classification',
				'Return Number',
				'Source',
				'GPS Time',
				'Index',
				'Level of Detail',
				'Composite'
			];

			let attributeSelection = panel.find('#optMaterial');
			for(let option of options){
				let elOption = $(`<option>${option}</option>`);
				attributeSelection.append(elOption);
			}

			let updateMaterialPanel = (event, ui) => {
				let selectedValue = attributeSelection.selectmenu().val();
				material.pointColorType = Utils.toMaterialID(selectedValue);

				let blockWeights = $('#materials\\.composite_weight_container');
				let blockElevation = $('#materials\\.elevation_container');
				let blockRGB = $('#materials\\.rgb_container');
				let blockColor = $('#materials\\.color_container');
				let blockIntensity = $('#materials\\.intensity_container');
				let blockI = $('#materials\\.i_container');
				let blockJ = $('#materials\\.j_container');
				let blockK = $('#materials\\.k_container');
				let blockIJK = $('#materials\\.ijk_container');
				let blockIndex = $('#materials\\.index_container');
				let blockTransition = $('#materials\\.transition_container');

				blockIndex.css('display', 'none');
				blockIntensity.css('display', 'none');
				blockI.css('display', 'none');
				blockJ.css('display', 'none');
				blockK.css('display', 'none');
				blockIJK.css('display', 'none');
				blockElevation.css('display', 'none');
				blockRGB.css('display', 'none');
				blockColor.css('display', 'none');
				blockWeights.css('display', 'none');
				blockTransition.css('display', 'none');

				if (selectedValue === 'Composite') {
					blockWeights.css('display', 'block');
					blockElevation.css('display', 'block');
					blockRGB.css('display', 'block');
					blockIntensity.css('display', 'block');
				} else if (selectedValue === 'Elevation') {
					blockElevation.css('display', 'block');
				} else if (selectedValue === 'RGB and Elevation') {
					blockRGB.css('display', 'block');
					blockElevation.css('display', 'block');
				} else if (selectedValue === 'RGB') {
					blockRGB.css('display', 'block');
				} else if (selectedValue === 'Color') {
					blockColor.css('display', 'block');
				} else if (selectedValue === 'Intensity') {
					blockIntensity.css('display', 'block');
				} else if (selectedValue === 'Intensity Gradient') {
					blockIntensity.css('display', 'block');
				} else if (selectedValue === "Index" ){
					blockIndex.css('display', 'block');
				} else if (selectedValue === "I" ){
					blockI.css('display', 'block');
				} else if (selectedValue === "J" ){
					blockJ.css('display', 'block');
				} else if (selectedValue === "K" ){
					blockK.css('display', 'block');
				} else if (selectedValue === "IJK" ){
					blockIJK.css('display', 'block');
				}
			};

			attributeSelection.selectmenu({change: updateMaterialPanel});

			let update = () => {
				attributeSelection.val(Utils.toMaterialName(material.pointColorType)).selectmenu('refresh');
			};
			this.addVolatileListener(material, "point_color_type_changed", update);

			update();
			updateMaterialPanel();
		}

		{
			let schemes = [
				{name: "SPECTRAL", icon: `${Potree.resourcePath}/icons/gradients_spectral.png`},
				{name: "YELLOW_GREEN", icon: `${Potree.resourcePath}/icons/gradients_yellow_green.png`},
				{name: "PLASMA", icon: `${Potree.resourcePath}/icons/gradients_plasma.png`},
				{name: "GRAYSCALE", icon: `${Potree.resourcePath}/icons/gradients_grayscale.png`},
				{name: "RAINBOW", icon: `${Potree.resourcePath}/icons/gradients_rainbow.png`},
			];

			let elSchemeContainer = panel.find("#elevation_gradient_scheme_selection");

			for(let scheme of schemes){
				let elScheme = $(`
					<span style="flex-grow: 1;">
						<img src="${scheme.icon}" class="button-icon" style="max-width: 100%" />
					</span>
				`);

				elScheme.click( () => {
					material.gradient = Gradients[scheme.name];
				});

				elSchemeContainer.append(elScheme);
			}

			//panel.find("#gradient_spectral").click( () => {
			//	pointcloud.material.gradient = Potree.Gradients.SPECTRAL;
			//});

			//panel.find("#gradient_yellow_green").click( () => {
			//	pointcloud.material.gradient = Potree.Gradients.YELLOW_GREEN;
			//});
		}

		{
			panel.find('#sldRGBGamma').slider({
				value: material.rgbGamma,
				min: 0, max: 4, step: 0.01,
				slide: (event, ui) => {material.rgbGamma = ui.value}
			});

			panel.find('#sldRGBContrast').slider({
				value: material.rgbContrast,
				min: -1, max: 1, step: 0.01,
				slide: (event, ui) => {material.rgbContrast = ui.value}
			});

			panel.find('#sldRGBBrightness').slider({
				value: material.rgbBrightness,
				min: -1, max: 1, step: 0.01,
				slide: (event, ui) => {material.rgbBrightness = ui.value}
			});

			panel.find('#sldHeightRange').slider({
				range: true,
				min: 0, max: 1000, step: 0.01,
				values: [0, 1000],
				slide: (event, ui) => {
					material.heightMin = ui.values[0];
					material.heightMax = ui.values[1];
				}
			});

			var intensityShiftpressed = false;
			var intensityRange= 0.25;

			var xShiftpressed = false;
			var xRange = 0.25;

			var yShiftpressed = false;
			var yRange = 0.25;

			var zShiftpressed = false;
			var zRange = 0.25;

			var IJKIShiftpressed = false;
			var IJKIRange = 0.25;

			var IShiftpressed = false;
			var IRange = 0.25;

			var IJKJShiftpressed = false;
			var IJKJRange = 0.25;

			var JShiftpressed = false;
			var JRange = 0.25;

			var IJKKShiftpressed = false;
			var IJKKRange = 0.25;

			var KShiftpressed = false;
			var KRange = 0.25;




			$(window).keydown(function(event) {
					intensityShiftpressed = true;
					var min = panel.find('#sldIntensityRange').slider("values")[0];
					var max = panel.find('#sldIntensityRange').slider("values")[1];
					intensityRange = max - min;
			}).keyup(function(event) {
					intensityShiftpressed = false;
			});


			


			$(window).keydown(function(event) {
					xShiftpressed = true;
					var min = panel.find('#sldIntensityX').slider("values")[0];
					var max = panel.find('#sldIntensityX').slider("values")[1];
					xRange = max - min;
			}).keyup(function(event) {
					xShiftpressed = false;
			});

			$(window).keydown(function(event) {
					yShiftpressed = true;
					var min = panel.find('#sldIntensityY').slider("values")[0];
					var max = panel.find('#sldIntensityY').slider("values")[1];
					yRange = max - min;
			}).keyup(function(event) {
					yShiftpressed = false;
			});

			$(window).keydown(function(event) {
					zShiftpressed = true;
					var min = panel.find('#sldIntensityZ').slider("values")[0];
					var max = panel.find('#sldIntensityZ').slider("values")[1];
					zRange = max - min;
			}).keyup(function(event) {
					zShiftpressed = false;
			});

			$(window).keydown(function(event) {
				IJKIShiftpressed = true;
				var min = panel.find('#sldIJKI').slider("values")[0];
				var max = panel.find('#sldIJKI').slider("values")[1];
				IJKIRange = max - min;
			}).keyup(function(event) {
				IJKIShiftpressed = false;
			});

			$(window).keydown(function(event) {
				IShiftpressed = true;
				var min = panel.find('#sldI').slider("values")[0];
				var max = panel.find('#sldI').slider("values")[1];
				IRange = max - min;
			}).keyup(function(event) {
				IShiftpressed = false;
			});

			$(window).keydown(function(event) {
				IJKJShiftpressed = true;
				var min = panel.find('#sldIJKJ').slider("values")[0];
				var max = panel.find('#sldIJKJ').slider("values")[1];
				IJKJRange = max - min;
			}).keyup(function(event) {
				IJKJShiftpressed = false;
			});

			$(window).keydown(function(event) {
				JShiftpressed = true;
				var min = panel.find('#sldJ').slider("values")[0];
				var max = panel.find('#sldJ').slider("values")[1];
				JRange = max - min;
			}).keyup(function(event) {
				JShiftpressed = false;
			});

			$(window).keydown(function(event) {
				IJKKShiftpressed = true;
				var min = panel.find('#sldIJKK').slider("values")[0];
				var max = panel.find('#sldIJKK').slider("values")[1];
				IJKKRange = max - min;
			}).keyup(function(event) {
				IJKKShiftpressed = false;
			});

			$(window).keydown(function(event) {
				KShiftpressed = true;
				var min = panel.find('#sldK').slider("values")[0];
				var max = panel.find('#sldK').slider("values")[1];
				KRange = max - min;
			}).keyup(function(event) {
				KShiftpressed = false;
			});


			panel.find('#sldIntensityRange').slider({
				intensityRange: true,
				min: 0, max: 65535, step: 1,
				values: [0, 65535],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (intensityShiftpressed) {
						if (ui.handleIndex === 0 && (min + intensityRange) < 65535)
							max = min + intensityRange;
						else if ((max - intensityRange) > 0)
							min = max - intensityRange;
					}
					material.intensityRange = [min, max];
				}
			});

			
			panel.find('#sldIntensityX').slider({
				xRange: true,
				min: 0, max: 1, step: 0.001,
				values: [0, 1],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					
					
					if (xShiftpressed) {
						if (ui.handleIndex === 0 && (min + xRange) < 1)
							max = min + xRange;
						else if ((max - xRange) > 0)
							min = max - xRange;
					}
					
					material.intensityX = [min, max];
				}
			});

			panel.find('#sldIntensityY').slider({
				range: true,
				min: 0, max: 1, step: 0.001,
				values: [0, 1],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (yShiftpressed) {
						if (ui.handleIndex === 0 && (min + yRange) < 1)
							max = min + yRange;
						else if ((max - yRange) > 0)
							min = max - yRange;
					}
									
					material.intensityY = [min, max];
				}
			});

			panel.find('#sldIntensityZ').slider({
				range: true,
				min: 0, max: 1, step: 0.001,
				values: [0, 1],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (zShiftpressed) {
						if (ui.handleIndex === 0 && (min + zRange) < 1)
							max = min + zRange;
						else if ((max - zRange) > 0)
							min = max - zRange;
					}
										
					material.intensityZ = [min, max];
				}
			});

			panel.find('#sldI').slider({
				range: true,
				min: 0, max: 225, step: 1,
				values: [0, 225],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (IShiftpressed) {
						if (ui.handleIndex === 0 && (min + IRange) <= 225)
							max = min + IRange;
						else if ((max - IRange) > 0)
							min = max - IRange;
					}
										
					material.IRange = [min, max];
				}
			});

			panel.find('#sldJ').slider({
				range: true,
				min: 0, max: 232, step: 1,
				values: [0, 232],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (JShiftpressed) {
						if (ui.handleIndex === 0 && (min + JRange) <= 232)
							max = min + JRange;
						else if ((max - JRange) > 0)
							min = max - JRange;
					}
										
					material.JRange = [min, max];
				}
			});

			panel.find('#sldK').slider({
				range: true,
				/*min: 0, max: 39, step: 1,
				values: [0, 39],*/
				min: 0, max: 39, step: 1,
				values: [0, 39],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (KShiftpressed) {
						if (ui.handleIndex === 0 && (min + KRange) <= 39)
							max = min + KRange;
						else if ((max - KRange) > 0)
							min = max - KRange;
					}
										
					material.KRange = [min, max];
				}
			});

			
			/*panel.find('#sldValueRange').slider({
				valueRange: true,
				min: 0, max: 1, step: 0.001,
				values: [0, 1],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (intensityShiftpressed) {
						if (ui.handleIndex === 0 && (min + intensityRange) < 65535)
							max = min + intensityRange;
						else if ((max - intensityRange) > 0)
							min = max - intensityRange;
					}
					material.valueRange = [min, max];
				}
			});*/


			panel.find('#sldIJKI').slider({
				range: true,
				min: 0, max: 225, step: 1,
				values: [0, 225],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (IJKIShiftpressed) {
						if (ui.handleIndex === 0 && (min + IJKIRange) <= 225)
							max = min + IJKIRange;
						else if ((max - IJKIRange) > 0)
							min = max - IJKIRange;
					}
										
					material.IRange = [min, max];
				}
			});

			panel.find('#sldIJKJ').slider({
				range: true,
				min: 0, max: 232, step: 1,
				values: [0, 232],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (IJKJShiftpressed) {
						if (ui.handleIndex === 0 && (min + IJKJRange) <= 232)
							max = min + IJKJRange;
						else if ((max - IJKJRange) > 0)
							min = max - IJKJRange;
					}
										
					material.JRange = [min, max];
				}
			});

			panel.find('#sldIJKK').slider({
				range: true,
				min: 0, max: 39, step: 1,
				values: [0, 39],				
				slide: (event, ui) => {
					let min = ui.values[0];
					let max = ui.values[1];
					if (IJKKShiftpressed) {
						if (ui.handleIndex === 0 && (min + IJKKRange) <= 39)
							max = min + IJKKRange;
						else if ((max - IJKKRange) > 0)
							min = max - IJKKRange;
					}
										
					material.KRange = [min, max];
				}
			});

			panel.find('#sldIntensityGamma').slider({
				value: material.intensityGamma,
				min: 0, max: 4, step: 0.01,
				slide: (event, ui) => {material.intensityGamma = ui.value}
			});

			panel.find('#sldIntensityTime').slider({
				value: material.intensityTime,
				min: 0, max: 3, step: 1,
				slide: (event, ui) => {material.intensityTime = ui.value}
			});

			panel.find('#sldIntensityContrast').slider({
				value: material.intensityContrast,
				min: -1, max: 1, step: 0.01,
				slide: (event, ui) => {material.intensityContrast = ui.value}
			});

			panel.find('#sldIntensityBrightness').slider({
				value: material.intensityBrightness,
				min: -1, max: 1, step: 0.01,
				slide: (event, ui) => {material.intensityBrightness = ui.value}
			});

			panel.find('#sldWeightRGB').slider({
				value: material.weightRGB,
				min: 0, max: 1, step: 0.01,
				slide: (event, ui) => {material.weightRGB = ui.value}
			});

			panel.find('#sldWeightIntensity').slider({
				value: material.weightIntensity,
				min: 0, max: 1, step: 0.01,
				slide: (event, ui) => {material.weightIntensity = ui.value}
			});

			panel.find('#sldWeightElevation').slider({
				value: material.weightElevation,
				min: 0, max: 1, step: 0.01,
				slide: (event, ui) => {material.weightElevation = ui.value}
			});

			panel.find('#sldWeightClassification').slider({
				value: material.weightClassification,
				min: 0, max: 1, step: 0.01,
				slide: (event, ui) => {material.weightClassification = ui.value}
			});

			panel.find('#sldWeightReturnNumber').slider({
				value: material.weightReturnNumber,
				min: 0, max: 1, step: 0.01,
				slide: (event, ui) => {material.weightReturnNumber = ui.value}
			});

			panel.find('#sldWeightSourceID').slider({
				value: material.weightSourceID,
				min: 0, max: 1, step: 0.01,
				slide: (event, ui) => {material.weightSourceID = ui.value}
			});

			panel.find(`#materials\\.color\\.picker`).spectrum({
				flat: true,
				showInput: true,
				preferredFormat: 'rgb',
				cancelText: '',
				chooseText: 'Apply',
				color: `#${material.color.getHexString()}`,
				move: color => {
					let cRGB = color.toRgb();
					let tc = new THREE.Color().setRGB(cRGB.r / 255, cRGB.g / 255, cRGB.b / 255);
					material.color = tc;
				},
				change: color => {
					let cRGB = color.toRgb();
					let tc = new THREE.Color().setRGB(cRGB.r / 255, cRGB.g / 255, cRGB.b / 255);
					material.color = tc;
				}
			});

			this.addVolatileListener(material, "color_changed", () => {
				panel.find(`#materials\\.color\\.picker`)
					.spectrum('set', `#${material.color.getHexString()}`);
			});

			let updateHeightRange = function () {
				let box = [pointcloud.pcoGeometry.tightBoundingBox, pointcloud.getBoundingBoxWorld()]
					.find(v => v !== undefined);

				pointcloud.updateMatrixWorld(true);
				box = Utils.computeTransformedBoundingBox(box, pointcloud.matrixWorld);

				let bWidth = box.max.z - box.min.z;
				let bMin = box.min.z - 0.2 * bWidth;
				let bMax = box.max.z + 0.2 * bWidth;

				let range = material.elevationRange;

				panel.find('#lblHeightRange').html(`${range[0].toFixed(2)} to ${range[1].toFixed(2)}`);
				panel.find('#sldHeightRange').slider({min: bMin, max: bMax, values: range});
			};

			let updateIntensityRange = function () {
				let range = material.intensityRange;
				let [min, max] = range.map(v => v);

				panel.find('#lblIntensityRange').html(`${parseInt(range[0])} to ${parseInt(range[1])}`);
				panel.find('#sldIntensityRange').slider({values: [min, max]});
			};

			let updateIntensityX = function () {
				let range = material.intensityX;
				let [min, max] = range.map(v => v);

				panel.find('#lblIntensityX').html(`${parseFloat(range[0])} to ${parseFloat(range[1])}`);
				panel.find('#sldIntensityX').slider({values: [min, max]});
			};

			let updateIntensityY = function () {
				let range = material.intensityY;
				let [min, max] = range.map(v => v);

				panel.find('#lblIntensityY').html(`${parseFloat(range[0])} to ${parseFloat(range[1])}`);
				panel.find('#sldIntensityY').slider({values: [min, max]});
			};

			let updateIntensityZ = function () {
				let range = material.intensityZ;
				let [min, max] = range.map(v => v);

				panel.find('#lblIntensityZ').html(`${parseFloat(range[0])} to ${parseFloat(range[1])}`);
				panel.find('#sldIntensityZ').slider({values: [min, max]});
			};

			let updateIRange = function () {
				let range = material.IRange; 
				let [min, max] = range.map(v => v);

				panel.find('#lblI').html(`${parseInt(range[0])} to ${parseInt(range[1])}`);
				panel.find('#sldI').slider({values: [min, max]});
			};

			let updateJRange = function () {
				let range = material.JRange; 
				let [min, max] = range.map(v => v);

				panel.find('#lblJ').html(`${parseInt(range[0])} to ${parseInt(range[1])}`);
				panel.find('#sldJ').slider({values: [min, max]});
			};

			let updateKRange = function () {
				let range = material.KRange; 
				let [min, max] = range.map(v => v);

				panel.find('#lblK').html(`${parseInt(range[0])} to ${parseInt(range[1])}`);
				panel.find('#sldK').slider({values: [min, max]});
			};

			/*let updateValueRange = function () {
				let range = material.valueRange; 
				let [min, max] = range.map(v => v);

				panel.find('#lblValueRange').html(`${parseFloat(range[0])} to ${parseFloat(range[1])}`);
				panel.find('#sldValueRange').slider({values: [min, max]});
			};*/

			let updateIJKIRange= function () {
				let range = material.IRange; 
				let [min, max] = range.map(v => v);

				panel.find('#lblIJKI').html(`${parseInt(range[0])} to ${parseInt(range[1])}`);
				panel.find('#sldIJKI').slider({values: [min, max]});
			};

			let updateIJKJRange = function () {
				let range = material.JRange; 
				let [min, max] = range.map(v => v);

				panel.find('#lblIJKJ').html(`${parseInt(range[0])} to ${parseInt(range[1])}`);
				panel.find('#sldIJKJ').slider({values: [min, max]});
			};

			let updateIJKKRange = function () {
				let range = material.KRange; 
				let [min, max] = range.map(v => v);

				panel.find('#lblIJKK').html(`${parseInt(range[0])} to ${parseInt(range[1])}`);
				panel.find('#sldIJKK').slider({values: [min, max]});
			};

			{
				updateHeightRange();
				panel.find(`#sldHeightRange`).slider('option', 'min');
				panel.find(`#sldHeightRange`).slider('option', 'max');
			}

			let onIntensityChange = () => {
				let gamma = material.intensityGamma;
				let contrast = material.intensityContrast;
				let brightness = material.intensityBrightness;
				let time = material.intensityTime;
				

				updateIntensityRange();
				updateIntensityX();
				updateIntensityY();
				updateIntensityZ();
				updateIRange();
				updateJRange();
				updateKRange();
				updateIJKIRange();				
				updateIJKJRange();
				updateIJKKRange();
				//updateValueRange();
				//material.gradient = Gradients["YELLOW_GREEN"];


				panel.find('#lblIntensityGamma').html(gamma.toFixed(2));
				panel.find('#lblIntensityContrast').html(contrast.toFixed(2));
				panel.find('#lblIntensityBrightness').html(brightness.toFixed(2));
				panel.find('#lblIntensityTime').html(time.toFixed(2));
				

				panel.find('#sldIntensityGamma').slider({value: gamma});
				panel.find('#sldIntensityContrast').slider({value: contrast});
				panel.find('#sldIntensityBrightness').slider({value: brightness});
				panel.find('#sldIntensityTime').slider({value: time});
				
			};

			let onRGBChange = () => {
				let gamma = material.rgbGamma;
				let contrast = material.rgbContrast;
				let brightness = material.rgbBrightness;

				panel.find('#lblRGBGamma').html(gamma.toFixed(2));
				panel.find('#lblRGBContrast').html(contrast.toFixed(2));
				panel.find('#lblRGBBrightness').html(brightness.toFixed(2));

				panel.find('#sldRGBGamma').slider({value: gamma});
				panel.find('#sldRGBContrast').slider({value: contrast});
				panel.find('#sldRGBBrightness').slider({value: brightness});
			};

			this.addVolatileListener(material, "material_property_changed", updateHeightRange);
			this.addVolatileListener(material, "material_property_changed", onIntensityChange);
			this.addVolatileListener(material, "material_property_changed", onRGBChange);

			updateHeightRange();
			onIntensityChange();
			onRGBChange();
		}

	}

	

	setMeasurement(object){

		let TYPE = {
			DISTANCE: {panel: DistancePanel},
			AREA: {panel: AreaPanel},
			POINT: {panel: PointPanel},
			ANGLE: {panel: AnglePanel},
			HEIGHT: {panel: HeightPanel},
			PROFILE: {panel: ProfilePanel},
			VOLUME: {panel: VolumePanel}
		};

		let getType = (measurement) => {
			if (measurement instanceof Measure) {
				if (measurement.showDistances && !measurement.showArea && !measurement.showAngles) {
					return TYPE.DISTANCE;
				} else if (measurement.showDistances && measurement.showArea && !measurement.showAngles) {
					return TYPE.AREA;
				} else if (measurement.maxMarkers === 1) {
					return TYPE.POINT;
				} else if (!measurement.showDistances && !measurement.showArea && measurement.showAngles) {
					return TYPE.ANGLE;
				} else if (measurement.showHeight) {
					return TYPE.HEIGHT;
				} else {
					return TYPE.OTHER;
				}
			} else if (measurement instanceof Profile) {
				return TYPE.PROFILE;
			} else if (measurement instanceof Volume) {
				return TYPE.VOLUME;
			}
		};

		//this.container.html("measurement");

		let type = getType(object);
		let Panel = type.panel;

		let panel = new Panel(this.viewer, object, this);
		this.container.append(panel.elContent);
	}

	setCamera(camera){
		let panel = new CameraPanel(this.viewer, this);
		this.container.append(panel.elContent);
	}

}
