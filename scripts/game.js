// game.js

function on_load() {

	window.CONSTANTS = {};

	var CONSTANTS = window.CONSTANTS;

	CONSTANTS[ "MAX_PROJ" ] = 256;
	CONSTANTS[ "TILE_WIDTH" ] = 96;
	CONSTANTS[ "HALF_WIDTH" ] = 96 / 2;
	CONSTANTS[ "GAME_WIDTH" ] = 10;
	CONSTANTS[ "COLORS" ] = [ "#ebdb00", "#740090", "#f15f0b", "#90c8ee", "#ca0032", "#c2c481", "#7f7d83", "#3fb631", "#df73b4", "#4566af", "#eb8062", "#5500a2", "#ddb100", "#9c0090", "#e4f93d", "#85000b", "#88c013", "#7f360d", "#e8001e", "#243a0d" ];
	CONSTANTS[ "TEMPLATE" ] = new Image();
	CONSTANTS[ "ANGLES" ] = [];
	CONSTANTS[ "MAX_THRESH_GAMMA" ] = 50;
	CONSTANTS[ "MAX_THRESH_BETA" ] = 35;
	CONSTANTS[ "MIN_THRESH_GAMMA" ] = 1;
	CONSTANTS[ "MIN_THRESH_BETA" ] = 2;
	CONSTANTS[ "SHOOT_THRESH" ] = 1000;
	CONSTANTS[ "LEVEL_SPEED" ] = [ 0.5, 1, 1.5, 2 ];
	CONSTANTS[ "MAX_DX" ] = 2;
	CONSTANTS[ "MAX_DY" ] = 2;
	for( var i = 0; i < 360; i++ ) {
		CONSTANTS.ANGLES.push( [] );
		CONSTANTS.ANGLES[ i ].push( i / 180 * Math.PI );
		CONSTANTS.ANGLES[ i ].push( Math.cos( CONSTANTS.ANGLES[ i ][ 0 ] ) );
		CONSTANTS.ANGLES[ i ].push( Math.sin( CONSTANTS.ANGLES[ i ][ 0 ] ) );
	}

	function init_app() {

		var game = new Game();

		function Projectile() {
			this.x = -1;
			this.y = -1;
			this.level = 0;
			this.rotation = -1;
			this.active = false;
			this.mine = true;
		}

		function Controller() {
			this.keyboard = false;
			this.alpha = -1;
			this.gamma = -1;
			this.beta = -1;
			this.shoot = false;
		}

		function PlayerData() {
			this.held_level = 0;
			this.held_start = -1;
			this.held_ammo = -1;
			this.held_end = -1;
			this.ammo = 3;
			this.reloaded = true;
		}

		function Player() {
			this.x = 0;
			this.y = 0;
			this.dx = 0;
			this.dy = 0;
			this.rotation = 0;
			this.data = new PlayerData();
		}

		function Renderer() {
			this.canvas = null;
			this.ctx = null;
			this.width = -1;
			this.height = -1;
		}

		function Timing() {
			this.last_update = -1;
			this.passed = -1;
		}

		function Sprites( p1, p2 ) {
			this.me = document.createElement( "canvas" );
			this.me.width = 384;
			this.me.height = 96;
			var ctx = this.me.getContext( "2d" );
			ctx.fillStyle = window.CONSTANTS.COLORS[ p1 ];
			ctx.fillRect( 0, 0, 384, 96 );
			ctx.drawImage( window.CONSTANTS.TEMPLATE, 0, 0, 384, 96 );
			this.projectiles = document.createElement( "canvas" );
			this.projectiles.width = 768;
			this.projectiles.height = 96;
			ctx = this.projectiles.getContext( "2d" );
			ctx.fillStyle = window.CONSTANTS.COLORS[ p1 ];
			ctx.fillRect( 36, 36, 24, 24 );
			ctx.fillRect( 120, 24, 48, 48 );
			ctx.fillRect( 204, 12, 72, 72 );
			ctx.fillRect( 288, 0, 96, 96 );
			ctx.fillStyle = window.CONSTANTS.COLORS[ p2 ];
			ctx.fillRect( 420, 36, 24, 24 );
			ctx.fillRect( 504, 24, 48, 48 );
			ctx.fillRect( 588, 12, 72, 72 );
			ctx.fillRect( 672, 0, 96, 96 );
		}

		function Game() {
			this.me = new Player();
			this.time = new Timing();
			this.render = new Renderer();
			this.sprites = new Sprites( 3, 2 );
			this.controller = new Controller();
			this.projectiles = [];
			this.landscape = true;
			for( var i = 0; i < window.CONSTANTS.MAX_PROJ; i++ ) {
				this.projectiles.push( new Projectile() );
			}
		}

		function update_projectile( i ) {
			var p = game.projectiles[ i ];
			var dx = CONSTANTS.LEVEL_SPEED[ p.level ] * CONSTANTS.ANGLES[ p.rotation ][ 1 ],
				dy = CONSTANTS.LEVEL_SPEED[ p.level ] * CONSTANTS.ANGLES[ p.rotation ][ 2 ];
			p.x += game.time.ticks * dx;
			p.y += game.time.ticks * dy;
		}

		function fire_projectile( x, y, rotation, mine, level ) {
			var i, proj;
			for( i = 0; i < CONSTANTS.MAX_PROJ; i++ ) {
				proj = game.projectiles[ i ];
				if( proj.active ) continue;
				game.projectiles[ i ].active = true;
				game.projectiles[ i ].x = x;
				game.projectiles[ i ].y = y;
				game.projectiles[ i ].rotation = rotation;
				game.projectiles[ i ].mine = mine;
				game.projectiles[ i ].level = level;
				return;
			}
		}

		function update_player() {
			var me = game.me, ticks, ticks_ammo;
			if( game.controller.shoot ) {
				if( me.data.held_start == -1 ) me.data.held_start = game.time.last_update;
				if( me.data.held_ammo == -1 ) me.data.held_ammo = game.time.last_update;
				ticks = game.time.last_update - me.data.held_start;
				ticks_ammo = game.time.last_update - me.data.held_ammo;
				if( me.data.ammo > 0 ) {
					if( ticks > CONSTANTS.SHOOT_THRESH * 3 ) {
						me.data.held_level = 3;
					} else if( ticks > CONSTANTS.SHOOT_THRESH * 2 ) {
						me.data.held_level = 2;
					} else if( ticks > CONSTANTS.SHOOT_THRESH ) {
						me.data.held_level = 1;
					} else {
						me.data.held_level = 0;
					}
					if( ticks_ammo > CONSTANTS.SHOOT_THRESH ) {
						me.data.ammo--;
						console.log( me.data.ammo );
						console.log( me.data.held_level );
						me.data.held_ammo = game.time.last_update;
					}
				}
			} else {
				if( me.data.held_start != -1 ) {
					me.data.held_start = -1;
					if( me.data.ammo == 0 ) {
						if( me.data.reloaded ) {
							me.data.held_end = -1;
							me.data.held_ammo = -1
							me.data.reloaded = false;
							fire_projectile( me.x, me.y, ( me.rotation + 270 ) % 360, true, me.data.held_level );
						}
					} else {
						if( me.data.held_level == 0 ) me.data.ammo--;
						fire_projectile( me.x, me.y, ( me.rotation + 270 ) % 360, true, me.data.held_level );
					}
				} else {
					if( me.data.held_end == -1 ) me.data.held_end = game.time.last_update;
					ticks = game.time.last_update - me.data.held_end;
					if( me.data.ammo < 3 && ticks > CONSTANTS.SHOOT_THRESH ) {
						me.data.held_end = game.time.last_update;
						me.data.ammo++;
						me.data.reloaded = true;
					}
				}
			}
			if( game.controller.keyboard ) {
				me.dx = 0.005;
				me.dy = 0.0025;
			} else {
				if( game.controller.beta < 0 && game.controller.beta > -CONSTANTS.MIN_THRESH_BETA ) game.controller.beta = 0;
				else if( game.controller.beta > 0 && game.controller.beta < CONSTANTS.MIN_THRESH_BETA ) game.controller.beta = 0;
				if( game.controller.gamma < 0 && game.controller.gamma > -CONSTANTS.MIN_THRESH_GAMMA ) game.controller.gamma = 0;
				else if( game.controller.gamma > 0 && game.controller.gamma < CONSTANTS.MIN_THRESH_GAMMA ) game.controller.gamma = 0;
				if( game.controller.beta != 0 ) game.controller.beta = ( ( game.controller.beta >> 31 ) | 1 ) * ( Math.abs( game.controller.beta ) - CONSTANTS.MIN_THRESH_BETA );
				if( game.controller.gamma != 0 ) game.controller.gamma = ( ( game.controller.gamma >> 31 ) | 1) * ( Math.abs( game.controller.gamma ) - CONSTANTS.MIN_THRESH_GAMMA );
				if( game.controller.beta < -CONSTANTS.MAX_THRESH_BETA ) game.controller.beta = -CONSTANTS.MAX_THRESH_BETA;
				else if( game.controller.beta > CONSTANTS.MAX_THRESH_BETA ) game.controller.beta = CONSTANTS.MAX_THRESH_BETA;
				if( game.controller.gamma < -CONSTANTS.MAX_THRESH_GAMMA ) game.controller.gamma = CONSTANTS.MAX_THRESH_GAMMA;
				else if( game.controller.gamma > CONSTANTS.MAX_THRESH_GAMMA ) game.controller.gamma = -CONSTANTS.MAX_THRESH_GAMMA;
				me.dx = CONSTANTS.MAX_DX * ( game.controller.beta / CONSTANTS.MAX_THRESH_GAMMA );
				me.dy = CONSTANTS.MAX_DY * ( -game.controller.gamma / CONSTANTS.MAX_THRESH_GAMMA );
			}
			me.x += game.time.ticks * me.dx;
			me.y += game.time.ticks * me.dy;
			if( me.dx > 0 ) {
				me.rotation = ( me.dx / CONSTANTS.MAX_DX * 45 ) | 0;
			} else if( me.dx < 0 ) {
				me.rotation = 359 + ( ( me.dx / CONSTANTS.MAX_DX * 45 ) | 0 );
			} else {
				me.rotation = 0;
			}
		}

		function render_game() {
			var ctx = game.render.ctx,
				canvas = game.render.canvas,
				p,
				i,
				x_offset;
			ctx.clearRect( 0, 0, canvas.width, canvas.height );
			ctx.fillStyle = "#FF0000";
			for( i = 0; i < CONSTANTS.MAX_PROJ; i++ ) {
				p = game.projectiles[ i ];
				if( p.active ) {
					if( p.x >= -CONSTANTS.HALF_WIDTH && p.x <= game.render.width + CONSTANTS.HALF_WIDTH ) {
						if( p.y >= -CONSTANTS.HALF_WIDTH && p.y <= game.render.height + CONSTANTS.HALF_WIDTH ) {
							if( p.mine ) x_offset = p.level * CONSTANTS.TILE_WIDTH;
							else x_offset = 384 + p.level * CONSTANTS.TILE_WIDTH;
							if( game.landscape ) {
								ctx.translate( p.x - CONSTANTS.HALF_WIDTH, p.y - CONSTANTS.HALF_WIDTH );
								ctx.rotate( CONSTANTS.ANGLES[ p.rotation ][ 0 ] );
								ctx.drawImage( game.sprites.projectiles, x_offset, 0, CONSTANTS.TILE_WIDTH, CONSTANTS.TILE_WIDTH, 0, 0, CONSTANTS.TILE_WIDTH, CONSTANTS.TILE_WIDTH );
							} else {
								ctx.translate( canvas.width - p.y - CONSTANTS.HALF_WIDTH, p.x - CONSTANTS.HALF_WIDTH );
								ctx.rotate( CONSTANTS.ANGLES[ 90 ][ 0 ] );
								ctx.rotate( CONSTANTS.ANGLES[ p.rotation ][ 0 ] );
								ctx.drawImage( game.sprites.projectiles, x_offset, 0, CONSTANTS.TILE_WIDTH, CONSTANTS.TILE_WIDTH, 0, 0, CONSTANTS.TILE_WIDTH, CONSTANTS.TILE_WIDTH );
							}
							ctx.setTransform( 1, 0, 0, 1, 0, 0 );
						}
					}
				}
			}
			x_offset = ( 3 - game.me.data.ammo ) * CONSTANTS.TILE_WIDTH;
			if( game.landscape ) {
				ctx.translate( ( game.me.x - CONSTANTS.HALF_WIDTH ) | 0, ( game.me.y - CONSTANTS.HALF_WIDTH ) | 0 );
				ctx.rotate( CONSTANTS.ANGLES[ game.me.rotation ][ 0 ] );
				ctx.drawImage( game.sprites.me, x_offset, 0, CONSTANTS.TILE_WIDTH, CONSTANTS.TILE_WIDTH, 0, 0, CONSTANTS.TILE_WIDTH, CONSTANTS.TILE_WIDTH );
			} else {
				ctx.translate( ( canvas.width - game.me.y + CONSTANTS.HALF_WIDTH ) | 0, ( game.me.x - CONSTANTS.HALF_WIDTH ) | 0 );
				ctx.rotate( CONSTANTS.ANGLES[ 90 ][ 0 ] );
				ctx.rotate( CONSTANTS.ANGLES[ game.me.rotation ][ 0 ] );
				ctx.drawImage( game.sprites.me, x_offset, 0, CONSTANTS.TILE_WIDTH, CONSTANTS.TILE_WIDTH, 0, 0, CONSTANTS.TILE_WIDTH, CONSTANTS.TILE_WIDTH );
			}
			ctx.setTransform( 1, 0, 0, 1, 0, 0 );
		}

		function update_game() {
			var i = 0;
			update_player();
			for( ; i < CONSTANTS.MAX_PROJ; i++ ) {
				if( game.projectiles[ i ].active ) update_projectile( i );
			}
			render_game();
		}

		function scale_canvas() {
			game.render.width = CONSTANTS.GAME_WIDTH * CONSTANTS.TILE_WIDTH;
			if( game.landscape ) {
				game.render.height = game.render.width / window.innerWidth * window.innerHeight;
				game.render.canvas.width = game.render.width;
				game.render.canvas.height = game.render.height;
			} else {
				game.render.height = game.render.width / window.innerHeight * window.innerWidth;
				game.render.canvas.height = game.render.width
				game.render.canvas.width = game.render.height;
			}
			game.render.ctx = game.render.canvas.getContext( "2d" );
		}

		function game_loop( ts ) {
			if( game.time.last_update == -1 ) game.time.last_update = ts;
			game.time.ticks = ts - game.time.last_update;
			game.time.last_update = ts;
			update_game();
			var landscape = window.innerWidth > window.innerHeight;
			if( landscape != game.landscape ) {
				game.landscape = landscape;
				scale_canvas();
			}
			window.requestAnimationFrame( game_loop );
		}

		function init_game() {
			game.render.canvas = document.getElementById( "game-canvas" );
			scale_canvas();
		}

		init_game();
		window.requestAnimationFrame( game_loop );

		function controller_orientation( evt ) {
			//game.controller.alpha = evt.alpha;
			game.controller.gamma = evt.gamma | 0;
			game.controller.beta = evt.beta | 0;
		}

		function touchstart_handler( evt ) {
			game.controller.shoot = true;
		}

		function touchend_handler( evt ) {
			game.controller.shoot = false;
		}

		function touchmove_handler( evt ) {
			evt.preventDefault();
			return false;
		}

		window.addEventListener( "deviceorientation", controller_orientation );
		game.render.canvas.addEventListener( "touchstart", touchstart_handler )
		game.render.canvas.addEventListener( "touchend", touchend_handler )
		game.render.canvas.addEventListener( "touchmove", touchmove_handler )

	}

	CONSTANTS.TEMPLATE.addEventListener( "load", init_app );
	CONSTANTS.TEMPLATE.src = "assets/template.png";
}

window.addEventListener( "load", on_load );