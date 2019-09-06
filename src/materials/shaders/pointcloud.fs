
#if defined paraboloid_point_shape
	#extension GL_EXT_frag_depth : enable
#endif

precision highp float;
precision highp int;

uniform mat4 viewMatrix;
uniform mat4 uViewInv;
uniform mat4 uProjInv;
uniform vec3 cameraPosition;


uniform mat4 projectionMatrix;
uniform float uOpacity;

uniform float blendHardness;
uniform float blendDepthSupplement;
uniform float fov;
uniform float uSpacing;
uniform float near;
uniform float far;
uniform float uPCIndex;
uniform float uScreenWidth;
uniform float uScreenHeight;

varying vec3	vColor;
varying float	vLogDepth;
varying vec3	vViewPosition;
varying float	vRadius;
varying float 	vPointSize;
varying vec3 	vPosition;


float specularStrength = 1.0;


vec3 hsv2rgb(vec3 c)
{
	float H1 = c.x * 6.0;
	float C = c.y * c.z;
	float X = C * (1.0 - abs(float(mod(H1, 2.0)) - 1.0));
	vec3 RGB1;
	if (0.0 <= H1 && H1 <= 1.0){
		RGB1 = vec3(C, X, 0.0);
	} else if (H1 <= 2.0) {
		RGB1 = vec3(X, C, 0.0);
	} else if (H1 <= 3.0) {
		RGB1 = vec3(0.0, C, X);
	} else if (H1 <= 4.0) {
		RGB1 = vec3(0.0, X, C);
	} else if (H1 <= 5.0) {
		RGB1 = vec3(X, 0.0, C);
	} else if (H1 <= 6.0) {
		RGB1 = vec3(C, 0.0, X);
	} else {
		RGB1 = vec3(0.0, 0.0, 0.0);
	}
	float m = c.z - C;
	vec3 RGB = vec3(RGB1.x + m, RGB1.y + m, RGB1.z + m);
	return RGB;
}

void main() {

	vec3 color = vColor;
	float depth = gl_FragCoord.z;


	#if defined(circle_point_shape) || defined(paraboloid_point_shape) 
		float u = 2.0 * gl_PointCoord.x - 1.0;
		float v = 2.0 * gl_PointCoord.y - 1.0;
	#endif
	
	#if defined(circle_point_shape) 
		float cc = u*u + v*v;
		if(cc > 1.0){
			discard;
		}
	#endif
		
	#if defined color_type_point_index
		gl_FragColor = vec4(color, uPCIndex / 255.0);
	#else
		gl_FragColor = vec4(color, uOpacity);
	#endif

	#if defined paraboloid_point_shape
		float wi = 0.0 - ( u*u + v*v);
		vec4 pos = vec4(vViewPosition, 1.0);
		pos.z += wi * vRadius;
		float linearDepth = -pos.z;
		pos = projectionMatrix * pos;
		pos = pos / pos.w;
		float expDepth = pos.z;
		depth = (pos.z + 1.0) / 2.0;
		gl_FragDepthEXT = depth;
		
		#if defined(color_type_depth)
			color.r = linearDepth;
			color.g = expDepth;
		#endif
		
		#if defined(use_edl)
			gl_FragColor.a = log2(linearDepth);
		#endif
		
	#else
		#if defined(use_edl)
			gl_FragColor.a = vLogDepth;
		#endif
	#endif

	#if defined(weighted_splats)
		float distance = 2.0 * length(gl_PointCoord.xy - 0.5);
		float weight = max(0.0, 1.0 - distance);
		weight = pow(weight, 1.5);

		gl_FragColor.a = weight;
		gl_FragColor.xyz = gl_FragColor.xyz * weight;
	#endif


	
	/*#if defined color_type_IJK
		if (color.x > 0.8){
			gl_FragColor.xyz = vec3(0.0, 1.0, 0.0);
		} else if (color.x < 0.1){
			gl_FragColor.xyz = vec3(0.0, 0.0, 1.0);
		} else {
			gl_FragColor.xyz = vec3(1.0, 0.0, 0.0);
		}
		//gl_FragColor.xyz = vec3(0.0, 0.0, 1.0);

	
	#endif

	/*
	#if defined color_type_I
		vec3 hsvColor = vec3(0.0, 1.0, 1.0);
		hsvColor.x = vColor.x;
		gl_FragColor.xyz = hsv2rgb(hsvColor);

	#endif
	

	
	#if defined color_type_J
		vec3 hsvColor = vec3(0.0, 1.0, 1.0);
		hsvColor.x = vColor.x;
		gl_FragColor.xyz = hsv2rgb(hsvColor);

	#endif

	#if defined color_type_K
		vec3 hsvColor = vec3(0.0, 1.0, 1.0);
		hsvColor.x = vColor.x;
		gl_FragColor.xyz = hsv2rgb(hsvColor);

	#endif
	*/
		
	
}


