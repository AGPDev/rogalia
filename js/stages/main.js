"use strict";
function mainStage(data) {
    setTimeout(function() {
        game.network.send("logon");
    }, 200);
    game.controller.initInterface();

    game.controller.chat.init(data.Chat);
    game.controller.system.users.sync(data.PlayersOnline);
    game.controller.minimap.sync(data.PlayersOnline);

    this.sync = function (data) {
        if (data.Warning) {
            game.controller.showWarning(data.Warning);
            return;
        }
        if (data.Reconnect) {
            document.location.search = "?server=" + data.Reconnect;
            return;
        }
        Entity.sync(data.Entities || [], data.RemoveEntities || null);
        Character.sync(data.Players || [], data.RemovePlayers || null);
        Character.sync(data.Mobs || [], data.RemoveMobs || null);
        Character.sync(data.NPCs || [], data.RemoveNPCs || null);

        data.Location && game.map.sync(data.Location);

        if (data.PlayersOnline) {
            game.controller.system.users.sync(data.PlayersOnline);
            game.controller.minimap.sync(data.PlayersOnline);
        }

        game.controller.chat.sync(data.Chat || []);
        game.controller.skills.update();
        game.controller.fight.update();
        game.controller.craft.update();
        game.controller.journal.update();
        if (data.Players && game.player.Id in data.Players) {
            game.controller.stats.sync();
        }
    };

    var startTime = 0;
    this.update = function(currentTime) {
        currentTime = currentTime || Date.now();
        var ellapsedTime = currentTime - startTime;
        startTime = currentTime;
        game.epsilon = ellapsedTime / 1000;

        game.entities.forEach(function(e) {
            e.update(game.epsilon);
        });
        game.help.update();
        game.controller.update();
    };

    var scr = game.screen;
    var cam = game.camera;
    function isVisible(t) {
        var p = t.getDrawPoint();

        return util.rectIntersects(
            p.x, p.y, t.sprite.width, t.sprite.height,
            cam.x, cam.y, scr.width, scr.height
        );
    }

    function drawObject(t) {
        if (isVisible(t))
            t.draw();
    }
    function drawUI(t) {
        if (isVisible(t))
            t.drawUI();
    }
    function drawAura(t) {
        if (isVisible(t))
            t.drawAura();
    }
    function drawClaim(t) {
        t.drawClaim();
    }

    // game.ctx.scale(0.3, 0.3);
    // game.ctx.translate(1000, 1000);

    this.draw = function() {
        game.ctx.clear();
        game.ctx.save();
        game.ctx.translate(-game.camera.x, -game.camera.y);

        this.drawGlobalEffects();

        game.map.draw();
        game.characters.forEach(drawAura);
        game.claims.forEach(drawClaim);
        game.sortedEntities.traverse(drawObject);
        if (debug.map.darkness)
            game.map.drawDarkness();
        game.characters.forEach(drawUI);
        game.controller.draw();
        // game.iso.fillRect(game.player.Location.X)
        // this.debug();
        game.ctx.restore();
    };

    var hueRotate = 0;
    this.drawGlobalEffects = function() {
        if ("MushroomTrip" in game.player.Effects) {
            game.canvas.style.filter = "hue-rotate(" + (hueRotate % 360) +"deg)";
            game.canvas.style.webkitFilter = "hue-rotate(" + (hueRotate % 360) +"deg)";
            hueRotate += 20;
        } else {
            game.canvas.style.filter = "";
            game.canvas.style.webkitFilter = "";
        }
    };

    this.debug = function() {
        game.ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        game.ctx.fillRect(game.camera.x, game.camera.y, game.screen.width, game.screen.height);

        // if (game.network.astar) {
        //     game.network.astar.forEach(function(node) {
        //         if (node.Unpassable)
        //             return;
        //         game.ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
        //         game.iso.fillRect(node.X, node.Y, node.Width, node.Height);
        //             game.ctx.strokeStyle = "#333";
        //         game.iso.strokeRect(node.X, node.Y, node.Width, node.Height);
        //     });
        // }

    };
    this.end = function() {};
}

Stage.add(mainStage);
