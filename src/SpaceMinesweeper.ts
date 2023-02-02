/* Lecture 6
 * CSCI 4611, Spring 2023, University of Minnesota
 * Instructor: Evan Suma Rosenberg <suma@umn.edu>
 * License: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 */ 

import * as gfx from 'gophergfx'

export class SpaceMinesweeper extends gfx.GfxApp
{
    // The graphics primitives that define objects in the scene 
    private ship: gfx.Rectangle;
    private star: gfx.Rectangle;
    private mine: gfx.Rectangle;

    // The stars will be drawn using a 2D particle system
    private starfield: gfx.Particles2;

    // These transforms are "groups" that are used to hold instances
    // of the same base object when they need to be placed in the scene
    // multiple times. They contain an array called .children that
    // you can iterate through to access all these objects.
    private mines: gfx.Transform2;

    // Member variable to store the current position of the mouse in
    // normalized device coordinates.
    private mousePosition: gfx.Vector2;

    // Member variable to record the last time a mine was spawned
    private timeSinceLastMineSpawn: number;

    constructor()
    {
        // The first line of any child class constructor must call
        // the base class's constructor using the super() method. 
        super();

        // Initialize all the member variables
        this.ship = new gfx.Rectangle();
        this.star = new gfx.Rectangle();
        this.mine = new gfx.Rectangle();

        this.starfield = new gfx.Particles2(this.star, 200);

        this.mines = new gfx.Transform2();

        this.mousePosition = new gfx.Vector2();

        this.timeSinceLastMineSpawn = 0;

        // This parameter zooms in on the scene to fit within the window.
        // Other options include FIT or STRETCH.
        this.renderer.viewport = gfx.Viewport.CROP;
    }

    createScene(): void 
    {
        // Load the star texture to make the object a sprite
        this.star.material.texture = new gfx.Texture('./star.png');

        // Place each star randomly throughout the scene.  The Math.random() 
        // function is also used to make them vary in size.
        for(let i=0; i < this.starfield.numParticles; i++)
        {
            this.starfield.particleSizes[i] = Math.random()*0.008 + 0.002;
            this.starfield.particlePositions[i].set(Math.random()*2-1, Math.random()*2-1);
        }

        // Update the particle system position and sizes 
        this.starfield.update(true, true);

         // Load the ship texture to make the object a sprite, then scale it 
        // to an appropriate size.
        this.ship.material.texture = new gfx.Texture('./ship.png');
        this.ship.scale.set(0.08, 0.08);

        // Load the mine texture to make the object a sprite, then scale it 
        // to an appropriate size.
        this.mine.material.texture =  new gfx.Texture('./mine.png');
        this.mine.scale.set(0.12, 0.12);

        this.ship.boundingCircle.radius *= 0.5;
        this.mine.boundingCircle.radius *= 0.5;

        // Add all the objects to the scene. Note that the order is important!
        // Objects that are added later will be rendered on top of objects
        // that are added first. This is most important for the stars; because
        // they are in the distant background, they should be added first.
        this.scene.add(this.starfield);
        this.scene.add(this.mines);
        this.scene.add(this.ship);
    }

    update(deltaTime: number): void 
    {
        // These parameters define the motions of objects in the scene,
        // which you will use to complete the code for this assignment.
        // You can feel free to modify them if you want your game
        // to have a different feel from the instructor's implementation.
        // Note that all speed variables are scaled by deltaTime.
        // This is important to make sure that the game plays similarly
        // on different devices regardless of the framerate.
        const shipSpeed = 0.8 * deltaTime;
        const mineSpeed = 0.2 * deltaTime;
        const mineSpawnInterval = 1;
        
        // Point the ship wherever the mouse cursor is located.
        // Note that this.mousePosition has already been converted to
        // normalized device coordinates.
        this.ship.lookAt(this.mousePosition);   

        if(this.ship.position.distanceTo(this.mousePosition) > 0.02)
        {
            this.ship.translateY(shipSpeed);
        }

        // This code makes the mines "home" in on the ship position
        this.mines.children.forEach((mine: gfx.Transform2) => {
            const mineToShip = gfx.Vector2.subtract(this.ship.position, mine.position);
            mineToShip.normalize();
            mineToShip.multiplyScalar(mineSpeed);
            mine.position.add(mineToShip);
        });

        // Check to see if the ship is colliding with each mine
        // If they are intersecting, then remove the mine
        this.mines.children.forEach((mine: gfx.Transform2) => {
            if(this.ship.intersects(mine, gfx.IntersectionMode2.BOUNDING_CIRCLE))
            {
                mine.remove();
            }
        });

        // Check to see if enough time has elapsed since the last
        // mine was spawned, and if so, then call the function
        // to spawn a new mine.
        this.timeSinceLastMineSpawn += deltaTime;
        if(this.timeSinceLastMineSpawn >= mineSpawnInterval)
        {
            this.spawnMine();
            this.timeSinceLastMineSpawn = 0;
        }
    }

    // When the mouse moves, store the current position of the mouse.
    // The MouseEvent object reports mouse information in screen coordinates.
    // We need to convert them to normalized device coordinates so that
    // they are in the same reference frame as the objects in our scene.
    onMouseMove(event: MouseEvent): void 
    {
        this.mousePosition.copy(this.getNormalizedDeviceCoordinates(event.x, event.y));
    }

    // To be completed in part 2
    private spawnMine(): void
    {
        const mineSpawnDistance = 1.5;
        const mineLimit = 20;

        const mineInstance = new gfx.ShapeInstance(this.mine);
        
        mineInstance.rotation = Math.random() * Math.PI * 2;
        mineInstance.translateY(mineSpawnDistance);

        this.mines.add(mineInstance);

        if(this.mines.children.length > mineLimit)
        {
            this.mines.children[0].remove();
        }
    }
}